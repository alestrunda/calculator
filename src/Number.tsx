interface Props {
  onClick: (value: number) => void;
  value: number;
}

const Number = ({ onClick, value }: Props) => {
  const handleClick = () => {
    onClick(value);
  };

  return <button onClick={handleClick}>{value}</button>;
};

export default Number;
