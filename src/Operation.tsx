import { OperationType } from "./App";

interface Props {
  onClick: (operation: OperationType) => void;
  type: OperationType;
}

const Operation = ({ onClick, type }: Props) => {
  const handleClick = () => {
    onClick(type);
  };

  return (
    <button className="blue" onClick={handleClick}>
      {type}
    </button>
  );
};

export default Operation;
