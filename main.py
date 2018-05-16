from flask import Flask, render_template, send_from_directory
app = Flask(__name__)

@app.route('/')
def main():
    return render_template('index.html')

@app.route('/js/<path:path>')
def send_js(path): 
	return send_from_directory('js', path)

@app.route('/libjs/<path:path>')
def send_libjs(path): 
	return send_from_directory('libjs', path)

@app.route('/style/<path:path>')
def send_css(path):
	return send_from_directory('css', path)

if __name__ == "__main__":
    app.run()