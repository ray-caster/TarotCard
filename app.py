from flask import Flask, render_template

# Initialize the Flask application
app = Flask(__name__)

@app.route('/')
def home():
    """
    Renders the main page of the application.
    """
    return render_template('index.html')

if __name__ == '__main__':
    # Runs the app on localhost, port 5000
    # Use debug=False in a production environment
    app.run(debug=True)