import os
import secrets

from flask import (Flask, render_template, request, jsonify,
                   render_template_string, redirect, url_for, session, g)
from flask_mail import Mail, Message
from flask_cors import CORS
from datetime import datetime, timedelta
from dotenv import load_dotenv

import auth
from content_store import get_store, COLLECTIONS
from image_store import get_image_store, UnsupportedImageError

app = Flask(__name__)

CORS(app)  # Enable CORS for frontend requests

load_dotenv()

# --- Session / admin auth configuration ---------------------------------
# A signing key is required for the shared-admin login session. In production
# set SECRET_KEY; locally a random per-process key is fine (logs out on restart).
app.secret_key = os.environ.get("SECRET_KEY") or secrets.token_hex(32)
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(days=7)
# Cap uploads at 8 MB to keep image handling sane.
app.config["MAX_CONTENT_LENGTH"] = 8 * 1024 * 1024


@app.context_processor
def inject_admin_flag():
    """Expose ``is_admin`` to every template so pages can show edit controls."""
    return {"is_admin": auth.is_admin()}


def block_value(key, default=""):
    """Return the saved override for an editable block, else its default.

    Templates call this (via the ``editable.html`` macros) to render any
    page text/image so it can be edited in place. Blocks are loaded once per
    request and cached on ``flask.g``.
    """
    if not hasattr(g, "_blocks"):
        try:
            g._blocks = get_store().get_blocks()
        except Exception:
            g._blocks = {}
    val = g._blocks.get(key)
    return val if (val is not None and val != "") else default


app.jinja_env.globals["block_value"] = block_value

app.config['MAIL_SERVER'] = 'smtp.gmail.com'  # Change based on your email provider
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.environ.get('EMAIL_USERNAME')  # Your email
app.config['MAIL_PASSWORD'] = os.environ.get('EMAIL_PASSWORD')  # Your email password/app password
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('EMAIL_USERNAME')

# Initialize Flask-Mail
mail = Mail(app)

# Email template for form submission
EMAIL_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f4f4f4; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .field { margin-bottom: 15px; }
        .field strong { display: inline-block; width: 120px; }
        .footer { background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>New Contact Form Submission</h2>
        </div>
        <div class="content">
            <div class="field">
                <strong>Name:</strong> {{ first_name }} {{ last_name }}
            </div>
            <div class="field">
                <strong>Email:</strong> {{ email }}
            </div>
            {% if phone %}
            <div class="field">
                <strong>Phone:</strong> {{ phone }}
            </div>
            {% endif %}
            {% if company %}
            <div class="field">
                <strong>Company:</strong> {{ company }}
            </div>
            {% endif %}
            <div class="field">
                <strong>Subject:</strong> {{ subject }}
            </div>
            <div class="field">
                <strong>Message:</strong><br>
                {{ message }}
            </div>
            <div class="field">
                <strong>Submitted:</strong> {{ timestamp }}
            </div>
        </div>
        <div class="footer">
            <p>This email was sent from your website contact form.</p>
        </div>
    </div>
</body>
</html>
"""

@app.route('/')
def index():
    return render_template('index_kbi.html', active_page='home')

@app.route('/about_us')
def about_us():
    return render_template('about_us.html', active_page='about_us')

@app.route('/customers')
def customers():
    return render_template('customers.html', active_page='customers')

@app.route('/products')
def products():
    items = get_store().list_items('products')
    return render_template('products.html', active_page='products', products=items)

@app.route('/machines')
def machines():
    items = get_store().list_items('machines')
    return render_template('machines.html', active_page='machines', machines=items)

@app.route('/certifications')
def certifications():
    return render_template('certifications.html', active_page='certifications')

@app.route('/processes')
def processes():
    items = get_store().list_items('processes')
    return render_template('processes.html', active_page='processes', processes=items)

@app.route('/contact_us')
def contact():
    return render_template('contact_us.html', active_page='contact')

@app.route('/submit-contact', methods=['POST'])
def submit_contact():
    """
    Handles the contact form submission by extracting data from the POST request,
    formatting an email message, and sending it. Responds with a JSON indicating
    the success or failure of the email sending process.
    """
    try:
        print("submit_contact route was hit!")
        data = request.get_json()
        first_name = data.get('firstName')
        last_name = data.get('lastName')
        email = data.get('email')
        phone = data.get('phone')
        company = data.get('company')
        subject = data.get('subject')
        message = data.get('message')
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        print(f"Received data: {data}")

        try:
            msg = Message(subject=subject, recipients=[app.config['MAIL_USERNAME']])
            msg.html = render_template_string(EMAIL_TEMPLATE, first_name=first_name, last_name=last_name,
                                               email=email, phone=phone, company=company,
                                               subject=subject, message=message, timestamp=timestamp)
            mail.send(msg)
            print("Email sent successfully!")

        except Exception as e:
            print(f"Error sending email: {e}")
            return jsonify({'success': False, 'message': f'Failed to send message: {str(e)}'}), 500

        return jsonify({'success': True, 'message': 'Message sent successfully!'})

    except Exception as e:
        print(f"Failed to send email: {e}")
        return jsonify({'success': False, 'message': str(e) or 'Failed to send message. Please try again.'}), 500




# ════════════════════════════════════════════════════════════════════════
#  ADMIN  —  shared-login auth + content management API
# ════════════════════════════════════════════════════════════════════════

# Editable fields per content type, used to validate/whitelist incoming data.
# Phase 1 implements "machines"; the others are listed for when they're wired up.
EDITABLE_FIELDS = {
    'machines': {'category', 'category_label', 'name', 'description',
                 'image', 'features', 'quantity', 'details'},
    'products': {'category', 'category_label', 'name', 'description', 'image'},
    'processes': {'num', 'name', 'description', 'image', 'features', 'equipment'},
    'team': {'name', 'role', 'image', 'bio'},
    'news': {'title', 'date', 'summary', 'image', 'body'},
}


def _clean_payload(collection, data):
    """Keep only whitelisted, non-id fields for the given collection."""
    allowed = EDITABLE_FIELDS.get(collection, set())
    return {k: v for k, v in (data or {}).items() if k in allowed}


@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    next_url = request.values.get('next') or url_for('index')
    if auth.is_admin():
        return redirect(next_url)
    if request.method == 'POST':
        if auth.check_password(request.form.get('password')):
            auth.login()
            return redirect(next_url)
        return render_template('admin_login.html',
                               error='Incorrect password.', next_url=next_url), 401
    return render_template('admin_login.html', next_url=next_url)


@app.route('/admin/logout')
def admin_logout():
    auth.logout()
    return redirect(url_for('index'))


# --- Content CRUD API (admin only) --------------------------------------
@app.route('/api/<collection>', methods=['GET'])
def api_list(collection):
    if collection not in COLLECTIONS:
        return jsonify({'error': 'unknown collection'}), 404
    return jsonify(get_store().list_items(collection))


@app.route('/api/<collection>', methods=['POST'])
@auth.login_required
def api_create(collection):
    if collection not in COLLECTIONS:
        return jsonify({'error': 'unknown collection'}), 404
    payload = _clean_payload(collection, request.get_json(silent=True))
    item = get_store().add_item(collection, payload)
    return jsonify(item), 201


@app.route('/api/<collection>/<item_id>', methods=['PUT', 'PATCH'])
@auth.login_required
def api_update(collection, item_id):
    if collection not in COLLECTIONS:
        return jsonify({'error': 'unknown collection'}), 404
    payload = _clean_payload(collection, request.get_json(silent=True))
    item = get_store().update_item(collection, item_id, payload)
    if item is None:
        return jsonify({'error': 'not found'}), 404
    return jsonify(item)


@app.route('/api/<collection>/<item_id>', methods=['DELETE'])
@auth.login_required
def api_delete(collection, item_id):
    if collection not in COLLECTIONS:
        return jsonify({'error': 'unknown collection'}), 404
    if not get_store().delete_item(collection, item_id):
        return jsonify({'error': 'not found'}), 404
    return jsonify({'deleted': item_id})


@app.route('/api/block', methods=['POST', 'PUT'])
@auth.login_required
def api_block():
    """Save one editable text/image block: {key, value}."""
    data = request.get_json(silent=True) or {}
    key = data.get('key')
    if not key or not isinstance(key, str):
        return jsonify({'error': 'missing key'}), 400
    value = data.get('value', '')
    result = get_store().update_block(key, value)
    return jsonify(result)


@app.route('/api/upload', methods=['POST'])
@auth.login_required
def api_upload():
    file = request.files.get('image') or request.files.get('file')
    if file is None or not file.filename:
        return jsonify({'error': 'no file provided'}), 400
    try:
        url = get_image_store().save(file)
    except UnsupportedImageError as exc:
        return jsonify({'error': str(exc)}), 400
    return jsonify({'url': url})


if __name__ == '__main__':
    server_port = os.environ.get('PORT', '8080')
    app.run(debug=False, port=server_port, host='0.0.0.0')
