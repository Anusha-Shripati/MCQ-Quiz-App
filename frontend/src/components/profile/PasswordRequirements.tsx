
const PasswordRequirements = ({ password }: { password: string }) => {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[@$!%*?&]/.test(password);

  const renderRequirementItem = (fulfilled: boolean, text: string) => (
    <li className={`${fulfilled ? 'text-green-500' : 'text-red-500'} flex items-center`}>
      <span className="mr-2">{fulfilled ? '✓' : '✗'}</span>
      {text}
    </li>
  );

  return (
    <div className="text-sm mt-1">
      <p className="font-medium">Password requirements:</p>
      <ul className="list-none pl-1 mt-1 space-y-1">
        {renderRequirementItem(hasMinLength, 'At least 8 characters')}
        {renderRequirementItem(hasUppercase, 'At least one uppercase letter (A-Z)')}
        {renderRequirementItem(hasLowercase, 'At least one lowercase letter (a-z)')}
        {renderRequirementItem(hasNumber, 'At least one number (0-9)')}
        {renderRequirementItem(hasSpecialChar, 'At least one special character (e.g., @, #, $, etc.)')}
      </ul>
    </div>
  );
};

export default PasswordRequirements;