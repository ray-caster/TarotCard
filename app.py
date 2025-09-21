import os
from flask import Flask, render_template, url_for

app = Flask(__name__)

# This context processor creates a new function that we can use in our templates
@app.context_processor
def inject_cache_buster():
    """
    Injects a function into the template context that generates a URL for a
    static file with a cache-busting query parameter.
    The query parameter is the last modification time of the file.
    """
    def cache_buster_url_for(endpoint, **values):
        if endpoint == 'static':
            filename = values.get('filename', None)
            if filename:
                # Get the absolute path to the static file
                filepath = os.path.join(app.root_path, endpoint, filename)
                if os.path.exists(filepath):
                    # Get the last modification time and append it as a query parameter
                    last_modified = int(os.path.getmtime(filepath))
                    values['v'] = last_modified
        return url_for(endpoint, **values)
    return dict(cache_buster_url_for=cache_buster_url_for)


@app.route('/')
def home():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)