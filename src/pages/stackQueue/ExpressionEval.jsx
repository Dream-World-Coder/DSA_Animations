import { memo, useState, useEffect, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { ShadCNHeader as Header } from "../../components/Header/ShadCNNav";
import SpeedControls from "../../components/utils/SpeedControl";
import Description from "../../components/utils/Description";
import SEOData from "../../components/SEO";

const StackItem = ({ value, index, isHighlighted, isTop }) => (
  <div
    className={`
      w-20 h-12 border-2 rounded-lg flex items-center justify-center text-white font-bold text-lg
      transition-all duration-300 transform
      ${isHighlighted ? "bg-green-500 border-green-400 scale-105" : "bg-neutral-700 border-neutral-600"}
      ${isTop ? "shadow-lg shadow-white/20" : ""}
    `}
    style={{
      transform: `translateY(${index * -2}px)`,
      zIndex: 100 - index,
    }}
  >
    {value}
  </div>
);

const Stack = ({ items, title, highlightedIndex = -1 }) => (
  <div className="flex flex-col items-center">
    <h3 className="text-white text-xl font-semibold mb-4">{title}</h3>
    <div className="relative min-h-[300px] flex flex-col-reverse items-center justify-start gap-1">
      {items.length === 0 ? (
        <div className="text-neutral-500 text-lg">Empty</div>
      ) : (
        items.map((item, index) => (
          <StackItem
            key={`${item}-${index}`}
            value={item}
            index={index}
            isHighlighted={index === highlightedIndex}
            isTop={index === items.length - 1}
          />
        ))
      )}
    </div>
  </div>
);

const ExpressionDisplay = ({ expression, currentIndex, processedPart }) => (
  <div className="text-center mb-6">
    <h3 className="text-white text-xl font-semibold mb-2">Expression</h3>
    <div className="bg-black rounded-lg p-4 font-mono text-2xl">
      {expression.split("").map((char, index) => (
        <span
          key={index}
          className={`
            ${index === currentIndex ? "bg-green-500 text-black" : "text-white"}
            ${index < currentIndex ? "text-green-400" : ""}
            px-1 transition-all duration-300
          `}
        >
          {char}
        </span>
      ))}
    </div>
    {processedPart && (
      <div className="mt-2 text-green-400 font-mono text-lg">
        Result: {processedPart}
      </div>
    )}
  </div>
);

const ExpEval = memo(function ExpEval() {
  const [expression, setExpression] = useState("3+4*2");
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(800);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mode, setMode] = useState("postfix"); // "postfix" or "evaluate"

  // Animation state
  const [operatorStack, setOperatorStack] = useState([]);
  const [outputQueue, setOutputQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAction, setCurrentAction] = useState("");
  const [steps, setSteps] = useState([]);
  const [isComplete, setIsComplete] = useState(false);

  const timeoutRef = useRef(null);

  const precedence = { "+": 1, "-": 1, "*": 2, "/": 2, "^": 3 };
  const isOperator = (char) => ["+", "-", "*", "/", "^"].includes(char);
  const isOperand = (char) => /[0-9a-zA-Z]/.test(char);

  const generateInfixToPostfixSteps = (expr) => {
    const steps = [];
    const operatorStack = [];
    const outputQueue = [];

    for (let i = 0; i < expr.length; i++) {
      const char = expr[i];

      if (isOperand(char)) {
        outputQueue.push(char);
        steps.push({
          index: i,
          char,
          action: `Add operand '${char}' to output`,
          operatorStack: [...operatorStack],
          outputQueue: [...outputQueue],
          highlightStack: -1,
        });
      } else if (char === "(") {
        operatorStack.push(char);
        steps.push({
          index: i,
          char,
          action: `Push '(' to operator stack`,
          operatorStack: [...operatorStack],
          outputQueue: [...outputQueue],
          highlightStack: operatorStack.length - 1,
        });
      } else if (char === ")") {
        while (
          operatorStack.length > 0 &&
          operatorStack[operatorStack.length - 1] !== "("
        ) {
          const op = operatorStack.pop();
          outputQueue.push(op);
          steps.push({
            index: i,
            char,
            action: `Pop '${op}' from stack to output`,
            operatorStack: [...operatorStack],
            outputQueue: [...outputQueue],
            highlightStack: operatorStack.length,
          });
        }
        if (operatorStack.length > 0) {
          operatorStack.pop(); // Remove '('
        }
        steps.push({
          index: i,
          char,
          action: `Pop '(' from stack`,
          operatorStack: [...operatorStack],
          outputQueue: [...outputQueue],
          highlightStack: -1,
        });
      } else if (isOperator(char)) {
        while (
          operatorStack.length > 0 &&
          operatorStack[operatorStack.length - 1] !== "(" &&
          precedence[operatorStack[operatorStack.length - 1]] >=
            precedence[char]
        ) {
          const op = operatorStack.pop();
          outputQueue.push(op);
          steps.push({
            index: i,
            char,
            action: `Pop '${op}' (higher precedence) to output`,
            operatorStack: [...operatorStack],
            outputQueue: [...outputQueue],
            highlightStack: operatorStack.length,
          });
        }
        operatorStack.push(char);
        steps.push({
          index: i,
          char,
          action: `Push operator '${char}' to stack`,
          operatorStack: [...operatorStack],
          outputQueue: [...outputQueue],
          highlightStack: operatorStack.length - 1,
        });
      }
    }

    while (operatorStack.length > 0) {
      const op = operatorStack.pop();
      outputQueue.push(op);
      steps.push({
        index: expr.length,
        char: "",
        action: `Pop remaining '${op}' to output`,
        operatorStack: [...operatorStack],
        outputQueue: [...outputQueue],
        highlightStack: operatorStack.length,
      });
    }

    return steps;
  };

  const generatePostfixEvaluationSteps = (postfixExpr) => {
    const steps = [];
    const stack = [];
    const expr = postfixExpr.split("");

    for (let i = 0; i < expr.length; i++) {
      const char = expr[i];

      if (isOperand(char)) {
        stack.push(parseInt(char));
        steps.push({
          index: i,
          char,
          action: `Push operand ${char} to stack`,
          operatorStack: [...stack],
          outputQueue: [],
          highlightStack: stack.length - 1,
        });
      } else if (isOperator(char)) {
        if (stack.length >= 2) {
          const b = stack.pop();
          const a = stack.pop();
          let result;

          switch (char) {
            case "+":
              result = a + b;
              break;
            case "-":
              result = a - b;
              break;
            case "*":
              result = a * b;
              break;
            case "/":
              result = Math.floor(a / b);
              break;
            case "^":
              result = Math.pow(a, b);
              break;
            default:
              result = 0;
          }

          stack.push(result);
          steps.push({
            index: i,
            char,
            action: `Apply ${char}: ${a} ${char} ${b} = ${result}`,
            operatorStack: [...stack],
            outputQueue: [],
            highlightStack: stack.length - 1,
          });
        }
      }
    }

    return steps;
  };

  const resetAnimation = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setCurrentStep(0);
    setCurrentIndex(0);
    setOperatorStack([]);
    setOutputQueue([]);
    setCurrentAction("");
    setIsAnimating(false);
    setIsComplete(false);
  };

  const startAnimation = () => {
    if (isAnimating) return;

    resetAnimation();
    let animationSteps;

    if (mode === "postfix") {
      animationSteps = generateInfixToPostfixSteps(expression);
    } else {
      // First convert to postfix, then evaluate
      const postfixSteps = generateInfixToPostfixSteps(expression);
      const postfixExpr =
        postfixSteps[postfixSteps.length - 1].outputQueue.join("");
      animationSteps = generatePostfixEvaluationSteps(postfixExpr);
    }

    setSteps(animationSteps);
    setTotalSteps(animationSteps.length);
    setIsAnimating(true);

    const animate = (stepIndex) => {
      if (stepIndex >= animationSteps.length) {
        setIsAnimating(false);
        setIsComplete(true);
        return;
      }

      const step = animationSteps[stepIndex];
      setCurrentStep(stepIndex + 1);
      setCurrentIndex(step.index);
      setOperatorStack(step.operatorStack);
      setOutputQueue(step.outputQueue);
      setCurrentAction(step.action);

      timeoutRef.current = setTimeout(() => {
        animate(stepIndex + 1);
      }, animationSpeed);
    };

    animate(0);
  };

  const stepForward = () => {
    if (currentStep < totalSteps && !isAnimating) {
      const step = steps[currentStep];
      setCurrentStep(currentStep + 1);
      setCurrentIndex(step.index);
      setOperatorStack(step.operatorStack);
      setOutputQueue(step.outputQueue);
      setCurrentAction(step.action);
    }
  };

  const stepBackward = () => {
    if (currentStep > 0 && !isAnimating) {
      const step = steps[currentStep - 2] || {
        index: 0,
        operatorStack: [],
        outputQueue: [],
        action: "",
      };
      setCurrentStep(currentStep - 1);
      setCurrentIndex(step.index);
      setOperatorStack(step.operatorStack);
      setOutputQueue(step.outputQueue);
      setCurrentAction(step.action);
    }
  };

  useEffect(() => {
    resetAnimation();
  }, [expression, mode]);

  const descriptionData = {
    heading: "Expression Evaluation Using Stack",
    subheading:
      "Visualizing infix to postfix conversion and postfix evaluation",
    summary: `<p>This animation demonstrates two fundamental stack-based algorithms:</p>
              <p><strong>Infix to Postfix:</strong> Uses the Shunting Yard algorithm to convert infix expressions to postfix notation using operator precedence.</p>
              <p><strong>Postfix Evaluation:</strong> Evaluates postfix expressions using a stack to store operands and apply operators.</p>`,
    lang: "python",
    code: `# Infix to Postfix Conversion
def infix_to_postfix(expression):
    stack = []
    output = []
    precedence = {'+': 1, '-': 1, '*': 2, '/': 2, '^': 3}

    for char in expression:
        if char.isalnum():
            output.append(char)
        elif char == '(':
            stack.append(char)
        elif char == ')':
            while stack and stack[-1] != '(':
                output.append(stack.pop())
            stack.pop()  # Remove '('
        elif char in precedence:
            while (stack and stack[-1] != '(' and
                   precedence.get(stack[-1], 0) >= precedence[char]):
                output.append(stack.pop())
            stack.append(char)

    while stack:
        output.append(stack.pop())

    return ''.join(output)

# Postfix Evaluation
def evaluate_postfix(expression):
    stack = []

    for char in expression:
        if char.isdigit():
            stack.append(int(char))
        elif char in '+-*/^':
            b = stack.pop()
            a = stack.pop()
            if char == '+': result = a + b
            elif char == '-': result = a - b
            elif char == '*': result = a * b
            elif char == '/': result = a // b
            elif char == '^': result = a ** b
            stack.append(result)

    return stack[0]`,
  };

  const seoData = {
    title: "Expression Evaluation Using Stack - DSA Visualization",
  };

  return (
    <>
      <SEOData data={seoData} />
      <div className="min-h-screen max-w-7xl mx-auto w-full flex flex-col items-center justify-start gap-20 py-32 px-4 bg-neutral-900">
        <Header />

        <div className="bg-neutral-800 rounded-lg p-8 border border-neutral-800 w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 tracking-wide">
              Expression Evaluation Using Stack
            </h1>
            <p className="text-neutral-300 text-lg">
              Step: {currentStep} / {totalSteps} | Mode:{" "}
              {mode === "postfix" ? "Infix → Postfix" : "Postfix Evaluation"}
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <label className="text-white text-sm">Expression:</label>
              <input
                type="text"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                className="bg-neutral-700 text-white px-3 py-2 rounded-md border border-neutral-600 w-32"
                disabled={isAnimating}
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-white text-sm">Mode:</label>
              <Select
                value={mode}
                onValueChange={setMode}
                disabled={isAnimating}
              >
                <SelectTrigger className="w-40 bg-neutral-700 border-neutral-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="postfix">Infix → Postfix</SelectItem>
                  <SelectItem value="evaluate">Evaluate Postfix</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <SpeedControls
              animationSpeed={animationSpeed}
              setAnimationSpeed={setAnimationSpeed}
              isAnimating={isAnimating}
            />

            <button
              onClick={startAnimation}
              disabled={isAnimating}
              className="bg-white text-black px-6 py-2 rounded-md font-semibold hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg flex items-center gap-2"
            >
              {isAnimating ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {isAnimating ? "Running..." : "Start"}
            </button>

            <button
              onClick={resetAnimation}
              disabled={isAnimating}
              className="bg-neutral-700 text-white px-6 py-2 rounded-md font-semibold hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>

            <button
              onClick={stepBackward}
              disabled={isAnimating || currentStep === 0}
              className="bg-neutral-700 text-white px-3 py-2 rounded-md font-semibold hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={stepForward}
              disabled={isAnimating || currentStep === totalSteps}
              className="bg-neutral-700 text-white px-3 py-2 rounded-md font-semibold hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-black p-8 rounded-lg min-h-[500px]">
            <ExpressionDisplay
              expression={expression}
              currentIndex={currentIndex}
              processedPart={outputQueue.join("")}
            />

            <div className="flex justify-center items-start gap-12 mb-8">
              <Stack
                items={operatorStack}
                title={mode === "postfix" ? "Operator Stack" : "Operand Stack"}
                highlightedIndex={steps[currentStep - 1]?.highlightStack}
              />

              {mode === "postfix" && (
                <Stack
                  items={outputQueue}
                  title="Output Queue"
                  highlightedIndex={-1}
                />
              )}
            </div>

            {currentAction && (
              <div className="text-center">
                <div className="bg-neutral-700 text-white px-6 py-3 rounded-lg inline-block font-semibold">
                  {currentAction}
                </div>
              </div>
            )}
          </div>

          <div className="w-full bg-neutral-700 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-white to-neutral-300 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0}%`,
              }}
            />
          </div>

          <div className="text-center text-neutral-300 text-sm">
            <p>
              Stack-based algorithms for expression processing with O(n) time
              complexity
            </p>
            <p className="mt-1 opacity-70">
              Demonstrates operator precedence and associativity rules
            </p>
          </div>
        </div>

        <Description dataObj={descriptionData} />
      </div>
    </>
  );
});

export default ExpEval;
