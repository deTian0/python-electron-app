from calculator.simple import SimpleCalculator
from flask import Flask, render_template
from flask_cors import cross_origin
app = Flask(__name__)




def calcOp(text):
    """based on the input text, return the operation result"""
    try:
        c = SimpleCalculator()
        c.run(text)
        return c.log[-1]
    except Exception as e:
        print(e)
        return 0.0

@app.route('/')
def hello_world():  # put application's code here
  return 'Hello World!'


@app.route("/<input>")
@cross_origin()
def calc(input):
    return calcOp(input)

if __name__ == '__main__':
  app.run(host='127.0.0.1', port=5001, use_reloader=False)
