// components/booking/PaymentForm.tsx
import React from 'react';

interface PaymentFormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardHolder: string;
}

interface PaymentFormProps {
  data: PaymentFormData;
  onChange: (data: PaymentFormData) => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ 
  data, 
  onChange 
}) => {
  const handleChange = (field: keyof PaymentFormData, value: string) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Card Holder Name *
        </label>
        <input
          type="text"
          required
          value={data.cardHolder}
          onChange={(e) => handleChange('cardHolder', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Name on card"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Card Number *
        </label>
        <input
          type="text"
          required
          value={data.cardNumber}
          onChange={(e) => handleChange('cardNumber', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="1234 5678 9012 3456"
          maxLength={19}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expiry Date *
          </label>
          <input
            type="text"
            required
            value={data.expiryDate}
            onChange={(e) => handleChange('expiryDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="MM/YY"
            maxLength={5}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CVV *
          </label>
          <input
            type="text"
            required
            value={data.cvv}
            onChange={(e) => handleChange('cvv', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="123"
            maxLength={3}
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Your payment information is secure and encrypted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};