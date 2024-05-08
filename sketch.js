// Global variables for store information and UI elements
let store1, store2;
let input1, input2, checkButton, button1, button2, nextButton;
let userChoice = '';  // To store user's choice of which store is better
let correctAnswers = [];
let answerDisplay = ''; // String to display the results below the check answers button
let currentQuestionIndex = 0;
let questionResults = [];
let calculator; // Instance of the calculator

function setup() {
  createCanvas(1200, 700);
  textSize(16);
  textAlign(CENTER);
  fill(0);

  // Initial setup of store objects, calculator, and buttons
  nextScenario(); // Load the first scenario
  setupButtons();
  setupCheckButton();
  setupNextQuestionButton();
  calculator = new Calculator(900, 50); // Instantiate the calculator
}

function nextScenario() {
  let scenario = generateRandomScenario();
  store1 = new Store(200, 150, scenario.store1.items, scenario.store1.price, scenario.store1.name, 'Store 1');
  store2 = new Store(600, 150, scenario.store2.items, scenario.store2.price, scenario.store2.name, 'Store 2');

  createElement('h2', 'Compare the unit prices and select which store offers the better deal:')
    .position(20, 10)
    .style('color', '#000')
    .style('font-size', '20px');

  input1 = createInput('');
  input1.position(200, 300);
  input1.size(100);
  input1.attribute('placeholder', 'Type the unit price here');

  input2 = createInput('');
  input2.position(600, 300);
  input2.size(100);
  input2.attribute('placeholder', 'Type the unit price here');
}

function generateRandomScenario() {
  const items = ['Pencils', 'Notebooks', 'Apples', 'Bananas'];
  const item = items[Math.floor(Math.random() * items.length)];
  const quantity1 = Math.floor(Math.random() * 9) + 2; // Quantities 2-10 to avoid division by 1
  const quantity2 = Math.floor(Math.random() * 9) + 2; // Quantities 2-10
  const price1 = (Math.round(Math.random() * 10) * quantity1).toFixed(2);
  const price2 = (Math.round(Math.random() * 10) * quantity2).toFixed(2);
  return {
    store1: {items: quantity1, price: parseFloat(price1), name: item},
    store2: {items: quantity2, price: parseFloat(price2), name: item}
  };
}

function setupButtons() {
  button1 = createButton('Store 1 is the better deal');
  button1.position(200, 350);
  button1.size(250);
  button1.mousePressed(() => selectStore('Store 1'));

  button2 = createButton('Store 2 is the better deal');
  button2.position(600, 350);
  button2.size(250);
  button2.mousePressed(() => selectStore('Store 2'));
}

function setupCheckButton() {
  checkButton = createButton('Check Answers');
  checkButton.position(400, 400);
  checkButton.size(200);
  checkButton.mousePressed(checkAnswers);
  checkButton.attribute('disabled', true);
}

function setupNextQuestionButton() {
  nextButton = createButton('Next Question');
  nextButton.position(1000, 650);
  nextButton.size(150, 50);
  nextButton.mousePressed(loadNextQuestion);
  nextButton.attribute('disabled', true);
}

function draw() {
  background(240);
  store1.display();
  store2.display();
  calculator.display();

  fill(255);
  rect(150, 450, 900, 200);
  fill(0);
  textAlign(CENTER, CENTER);
  text(answerDisplay, 150, 450, 900, 200);
}

function selectStore(store) {
  userChoice = store;
  updateSelection();
  if (input1.value() && input2.value()) {
    checkButton.removeAttribute('disabled');
  }
}

function checkAnswers() {
  let unitPrice1 = store1.price / store1.quantity;
  let unitPrice2 = store2.price / store2.quantity;
  let correctStore = unitPrice1 < unitPrice2 ? 'Store 1' : 'Store 2';
  let correct = userChoice === correctStore;

  answerDisplay = `Your choice for better deal: ${userChoice}\n`;
  answerDisplay += `Correct unit price for Store 1: $${unitPrice1.toFixed(2)} (Calculated: ${store1.quantity} items for $${store1.price})\n`;
  answerDisplay += `Correct unit price for Store 2: $${unitPrice2.toFixed(2)} (Calculated: ${store2.quantity} items for $${store2.price})\n`;
  answerDisplay += `Better deal: ${correct ? 'Correct' : 'Try Again. Use the formula: Unit Price = Total Price / Quantity.'}`;

  questionResults.push({ question: currentQuestionIndex, correct });
  currentQuestionIndex++;
  nextButton.removeAttribute('disabled');
  checkButton.attribute('disabled', true);
}

function loadNextQuestion() {
  if (currentQuestionIndex < 10) {
    nextScenario(); // Load new scenario
    resetInputs();
    answerDisplay = '';
    nextButton.attribute('disabled', true);
  } else {
    showSummary();
  }
}

function resetInputs() {
  input1.value('');
  input2.value('');
  userChoice = '';
  store1.selected = false;
  store2.selected = false;
}

function showSummary() {
  answerDisplay = 'Summary of Results:\n';
  questionResults.forEach((result, index) => {
    answerDisplay += `Question ${index + 1}: ${result.correct ? 'Correct' : 'Incorrect'}\n`;
  });
}

class Store {
  constructor(x, y, quantity, price, item, label) {
    this.x = x;
    this.y = y;
    this.quantity = quantity;
    this.price = price;
    this.item = item;
    this.label = label;
    this.selected = false; // Track selection state
  }

  display() {
    fill(this.selected ? color(100, 200, 100) : 255);
    stroke(0);
    rect(this.x, this.y, 220, 120);
    fill(0);
    textSize(16);
    // Display item and price information clearly inside the rectangle
    text(`${this.quantity} ${this.item} for $${this.price.toFixed(2)}`, this.x + 110, this.y + 60);
    // Label above the rectangle for clear identification
    text(this.label, this.x + 110, this.y - 20);
    for (let i = 0; i < this.quantity; i++) {
      fill(255, 0, 0);
      rect(this.x + 10 + (i * 18), this.y + 70, 10, 30); // Visual representation of quantity
    }
  }
}

function updateSelection() {
  store1.selected = false;
  store2.selected = false;
  
  if (userChoice === 'Store 1') {
    store1.selected = true;
  } else if (userChoice === 'Store 2') {
    store2.selected = true;
  }
}

class Calculator {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.displayValue = '';
    this.buttons = [];
    this.setupButtons();
  }

  setupButtons() {
    let labels = ['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', 'C', '0', '=', '+'];
    labels.forEach((label, i) => {
      let col = i % 4;
      let row = Math.floor(i / 4);
      let button = createButton(label);
      button.position(this.x + col * 60, this.y + 60 + row * 60);
      button.size(50, 50);
      button.mousePressed(() => this.pressButton(label));
      this.buttons.push(button);
    });
  }
  
  display() {
    fill(255);
    stroke(0);
    rect(this.x - 20, this.y - 40, 260, 50); // Display area for calculator
    fill(0);
    textSize(24);
    textAlign(RIGHT, CENTER);
    text(this.displayValue, this.x - 20, this.y - 40, 240, 50); // Ensure text fits within display
  }
  
  pressButton(label) {
    if (label === 'C') {
      this.displayValue = '';
    } else if (label === '=') {
      try {
        this.displayValue = eval(this.displayValue).toString();
      } catch (e) {
        this.displayValue = 'Error';
      }
    } else {
      this.displayValue += label;
    }
  }
}
