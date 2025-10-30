# p5 Quiz Visualizer

## Overview
The p5 Quiz Visualizer is an interactive quiz application built using p5.js. It provides an engaging way for students to take quizzes while visualizing their scores through animations and effects. The application reads questions from a CSV file and offers a dynamic user interface for answering questions.

## Project Structure
```
p5-quiz-visualizer
├── index.html          # Main HTML document
├── package.json        # npm configuration file
├── .gitignore          # Files to ignore in version control
├── README.md           # Project documentation
├── src
│   ├── sketch.js       # Main entry point for the p5.js application
│   ├── visuals.js      # Functions for animated visuals based on scores
│   ├── ui.js           # User interface management
│   ├── effects.js      # Cursor and selection effects
│   ├── csvLoader.js    # Functions for loading and parsing CSV files
│   └── styles.css      # Styles for the quiz system
└── data
    └── questions.csv   # CSV file containing the question bank
```

## Setup Instructions
1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd p5-quiz-visualizer
   ```

2. **Install dependencies**:
   Make sure you have Node.js installed. Then run:
   ```
   npm install
   ```

3. **Run the application**:
   You can use a local server to run the application. For example, you can use the `http-server` package:
   ```
   npx http-server
   ```
   Open your browser and navigate to `http://localhost:8080` (or the port specified by your server).

## Usage
- Upon loading the application, users will be presented with a series of questions.
- Users can select their answers, and upon completion, their scores will be visualized through animations.
- The application provides feedback based on the scores, including praise and encouragement.

## Contributing
Feel free to submit issues or pull requests to improve the application. Contributions are welcome!

## License
This project is licensed under the MIT License. See the LICENSE file for details.