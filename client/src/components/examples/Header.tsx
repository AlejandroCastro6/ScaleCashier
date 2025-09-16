import Header from '../Header';

export default function HeaderExample() {
  const handleOpenSettings = () => {
    console.log('Open settings');
  };

  return (
    <Header 
      businessName="My Grocery Store"
      cashierName="John Doe"
      onOpenSettings={handleOpenSettings}
    />
  );
}