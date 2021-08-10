import { useEffect, useRef, useState } from "react";
import { createMachine, interpret } from "xstate";

import Number from "./Number";
import Operation from "./Operation";

import "./App.css";

export enum OperationType {
  ADD = "+",
  DIVIDE = "/",
  MULTIPLY = "*",
  SUBTRACT = "-",
}

interface MachineContext {
  firstOperand: string;
  operator?: OperationType;
  secondOperand: string;
  output: number;
}

const defaultMachineContext: MachineContext = {
  firstOperand: "",
  operator: undefined,
  secondOperand: "",
  output: 0,
};

const doTheMath = (a: number, b: number, operation: OperationType) => {
  const operations = {
    [OperationType.ADD]: a + b,
    [OperationType.DIVIDE]: a / b,
    [OperationType.MULTIPLY]: a * b,
    [OperationType.SUBTRACT]: a - b,
  };
  return operations[operation];
};

//states should be camelCase and actions should be uppercase
const calculatorMachine = createMachine(
  {
    id: "myCalculatorMachine",
    initial: "firstOperand",
    context: defaultMachineContext,
    states: {
      firstOperand: {
        on: {
          C: {
            actions: ["onClear"],
          },
          INPUT: {
            actions: ["onInputFirstOperand"],
          },
          INPUT_OPERATOR: {
            actions: ["onInputOperator", "onResetOutput"],
            cond: (context: MachineContext) => context.firstOperand !== "",
            target: "secondOperand",
          },
        },
      },
      secondOperand: {
        on: {
          C: {
            actions: ["onClear"],
            target: "firstOperand",
          },
          INPUT: {
            actions: ["onInputSecondOperand"],
          },
          INPUT_OPERATOR: {
            actions: ["onRunningResult", "onInputOperator"],
            target: "secondOperand",
          },
          SUBMIT: {
            actions: ["onSubmit"],
            target: "result",
          },
        },
      },
      result: {
        on: {
          C: {
            actions: ["onClear"],
            target: "firstOperand",
          },
          INPUT: {
            actions: ["onInputFirstOperand"],
            target: "firstOperand",
          },
        },
      },
    },
  },
  {
    actions: {
      onClear: (context) => {
        context.firstOperand = "";
        context.operator = undefined;
        context.secondOperand = "";
        context.output = 0;
      },
      onInputFirstOperand: (context, event) => {
        context.firstOperand += event.value;
        context.output = parseInt(context.firstOperand);
      },
      onInputOperator: (context, event) => {
        context.operator = event.value;
      },
      onInputSecondOperand: (context, event) => {
        context.secondOperand += event.value;
        context.output = parseInt(context.secondOperand);
      },
      onResetOutput: (context) => {
        context.output = 0;
      },
      onRunningResult: (context) => {
        if (!context.operator) return;
        const result = doTheMath(
          parseInt(context.firstOperand),
          parseInt(context.secondOperand),
          context.operator
        );
        context.firstOperand = result.toString();
        context.secondOperand = "";
        context.output = result;
      },
      onSubmit: (context) => {
        if (!context.operator) return;
        context.output = doTheMath(
          parseInt(context.firstOperand),
          parseInt(context.secondOperand),
          context.operator
        );
        context.firstOperand = "";
        context.secondOperand = "";
      },
    },
  }
);

function App() {
  //TODO: types
  const [currentState, setCurrentState] = useState<any>({
    context: defaultMachineContext,
  });
  const calculatorService = useRef<any>({}); //TODO: types

  useEffect(() => {
    function initCalculator() {
      calculatorService.current = interpret(calculatorMachine).onTransition(
        (current) => {
          console.log("transtion to new state", current);
          setCurrentState(current);
        }
      );
      calculatorService.current.start();
    }

    initCalculator();
    return () => {
      calculatorService.current.stop();
    };
  }, [calculatorService]);

  const handleNumberClick = (value: number) => {
    calculatorService.current.send({
      type: "INPUT",
      value,
    });
  };

  const handleOperatorClick = (operator: OperationType) => {
    calculatorService.current.send({ type: "INPUT_OPERATOR", value: operator });
  };

  const handleReset = () => {
    calculatorService.current.send({ type: "C" });
  };

  const handleSubmit = () => {
    calculatorService.current.send({ type: "SUBMIT" });
  };

  return (
    <div className="calculator">
      <input readOnly type="text" value={currentState.context.output} />
      <div className="controls">
        <Number onClick={handleNumberClick} value={1} />
        <Number onClick={handleNumberClick} value={2} />
        <Number onClick={handleNumberClick} value={3} />
        <Operation onClick={handleOperatorClick} type={OperationType.ADD} />
        <Number onClick={handleNumberClick} value={4} />
        <Number onClick={handleNumberClick} value={5} />
        <Number onClick={handleNumberClick} value={6} />
        <Operation
          onClick={handleOperatorClick}
          type={OperationType.SUBTRACT}
        />
        <Number onClick={handleNumberClick} value={7} />
        <Number onClick={handleNumberClick} value={8} />
        <Number onClick={handleNumberClick} value={9} />
        <Operation
          onClick={handleOperatorClick}
          type={OperationType.MULTIPLY}
        />
        <button className="red" onClick={handleReset}>
          C
        </button>
        <Number onClick={handleNumberClick} value={0} />
        <button className="green" onClick={handleSubmit}>
          =
        </button>
        <Operation onClick={handleOperatorClick} type={OperationType.DIVIDE} />
      </div>
    </div>
  );
}

export default App;
