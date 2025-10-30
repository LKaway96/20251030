function preload() {
    this.questions = loadTable('data/questions.csv', 'csv', 'header');
}

function getQuestions() {
    let questionArray = [];
    for (let i = 0; i < this.questions.getRowCount(); i++) {
        let question = this.questions.getString(i, 'question');
        let options = [];
        for (let j = 0; j < this.questions.getColumnCount() - 1; j++) {
            options.push(this.questions.getString(i, 'option' + j));
        }
        let answer = this.questions.getString(i, 'answer');
        questionArray.push({ question, options, answer });
    }
    return questionArray;
}