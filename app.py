import os

from flask import Flask, render_template

from flask import Flask, request, jsonify, render_template_string
from flask_mail import Mail, Message
from flask_cors import CORS
from datetime import datetime
from dotenv import load_dotenv
app = Flask(__name__)

CORS(app)  # Enable CORS for frontend requests

load_dotenv()

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
    return render_template('products.html', active_page='products')

@app.route('/machines')
def machines():
    return render_template('machines.html', active_page='machines')

@app.route('/certifications')
def certifications():
    return render_template('certifications.html', active_page='certifications')

@app.route('/processes')
def processes():
    return render_template('processes.html', active_page='processes')

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




if __name__ == '__main__':
    server_port = os.environ.get('PORT', '8080')
    app.run(debug=False, port=server_port, host='0.0.0.0')
