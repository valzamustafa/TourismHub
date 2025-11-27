interface Booking {
  id: string;
  activityName: string;
  userName: string;
  bookingDate: string;
  numberOfPeople: number;
  totalAmount: number;
  status: string;
}

interface BookingsTableProps {
  bookings: Booking[];
}

const BookingsTable = ({ bookings }: BookingsTableProps) => {
  return (
    <div className="bg-teal-50/50 backdrop-blur-sm rounded-3xl shadow-lg border border-teal-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-teal-200 bg-white/50">
        <h2 className="text-2xl font-bold text-gray-900">Adventure Bookings</h2>
        <p className="text-gray-700">Manage all mountain trip reservations</p>
      </div>
      <div className="overflow-hidden">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-teal-100/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Activity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                People
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white/30 divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-teal-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {booking.activityName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {booking.userName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(booking.bookingDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {booking.numberOfPeople}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${booking.totalAmount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    booking.status === 'Confirmed' 
                      ? 'bg-green-200 text-green-800'
                      : booking.status === 'Pending'
                      ? 'bg-yellow-200 text-yellow-800'
                      : 'bg-red-200 text-red-800'
                  }`}>
                    {booking.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingsTable;