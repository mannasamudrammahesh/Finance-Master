from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import random
import datetime
import openai

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///finance_master.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# OpenAI Configuration
openai.api_key = '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'  # Replace with your actual API key

# Database Models
class QuizHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    quiz_level = db.Column(db.String(20), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    date = db.Column(db.DateTime, default=datetime.datetime.utcnow)

# Quiz Questions Database
quiz_questions = {
    "beginner": [
        {
            "question": "What is a budget?",
            "options": [
                "A plan for managing income and expenses",
                "A type of bank account",
                "A credit card bill",
                "A stock market investment"
            ],
            "correct": 0,
            "explanation": "A budget is a financial plan that helps track and manage income and expenses effectively."
        }
    ]
}

# Financial Planning Templates
financial_advice = {
    "retirement": {
        "moderate": [
            "Start contributing to retirement accounts early",
            "Take advantage of employer matching in 401(k)",
            "Consider opening a Roth IRA",
            "Invest in a diverse portfolio with higher risk tolerance",
            "Build emergency savings alongside retirement savings"
        ]
    }
}

# Routes
@app.route('/')
def home():
    return jsonify({'message': 'Welcome to the Finance Master API'})

@app.route('/api/quiz/<level>', methods=['GET'])
def get_quiz(level):
    if level in quiz_questions:
        questions = random.sample(quiz_questions[level], min(5, len(quiz_questions[level])))
        return jsonify(questions)
    return jsonify({'message': 'Invalid quiz level'}), 400

@app.route('/api/submit_quiz', methods=['POST'])
def submit_quiz():
    data = request.get_json()

    if not data or 'score' not in data or 'level' not in data:
        return jsonify({'message': 'Missing required fields'}), 400

    score = data['score']
    level = data['level']

    quiz_history = QuizHistory(
        quiz_level=level,
        score=score
    )

    db.session.add(quiz_history)
    db.session.commit()

    return jsonify({'message': 'Quiz results submitted successfully'})

@app.route('/api/finance_planning', methods=['POST'])
def get_financial_advice():
    data = request.get_json()

    if not data or 'planning_type' not in data:
        return jsonify({'message': 'Missing required fields'}), 400

    planning_type = data.get('planning_type')
    user_profile = data.get('profile', 'moderate')

    if planning_type in financial_advice:
        if planning_type in ['retirement', 'investment']:
            advice = financial_advice[planning_type][user_profile]
        else:
            advice = financial_advice[planning_type]

        return jsonify({
            'planning_type': planning_type,
            'recommendations': advice
        })

    return jsonify({'message': 'Invalid planning type'}), 400

@app.route('/api/user_stats', methods=['GET'])
def get_user_stats():
    quiz_history = QuizHistory.query.all()

    stats = {
        'quiz_history': [{
            'level': h.quiz_level,
            'score': h.score,
            'date': h.date.strftime('%Y-%m-%d %H:%M:%S')
        } for h in quiz_history]
    }

    return jsonify(stats)

@app.route('/api/openai_query', methods=['POST'])
def openai_query():
    data = request.get_json()

    if not data or 'query' not in data:
        return jsonify({'message': 'Query is missing'}), 400

    try:
        response = openai.Completion.create(
            engine="davinci",
            prompt=data['query'],
            max_tokens=100
        )
        return jsonify({'response': response.choices[0].text.strip()})
    except Exception as e:
        return jsonify({'message': str(e)}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
