import WeightDisplay from '../WeightDisplay';

export default function WeightDisplayExample() {
  const handleWeightChange = (weight: number) => {
    console.log('Weight changed:', weight);
  };

  return (
    <WeightDisplay 
      onWeightChange={handleWeightChange}
      unit="kg"
    />
  );
}