import { CheckCircle, XCircle, Clock, Edit, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

const rentalProducts = [
  { 
    id: "#20462", 
    image: "assets/apple.png", 
    product: "Hat", 
    customer: "Matt Dickerson", 
    date: "13/05/2022", 
    amount: "$4.95", 
    payment: "Transfer Bank", 
    status: "Delivered" 
  },
  { 
    id: "#18933", 
    image: "assets/apple.png",
    product: "Laptop", 
    customer: "Wiktoria", 
    date: "22/05/2022", 
    amount: "$8.95", 
    payment: "Cash on Delivery", 
    status: "Delivered" 
  },
  { 
    id: "#45169", 
    image: "assets/apple.png",
    product: "Phone", 
    customer: "Trixie Byrd", 
    date: "15/06/2022", 
    amount: "$11,149.95", 
    payment: "Cash on Delivery", 
    status: "Process" 
  },
  { 
    id: "#17188", 
    image: "assets/apple.png",
    product: "Headset", 
    customer: "Sanderson", 
    date: "25/09/2022", 
    amount: "$22.95", 
    payment: "Cash on Delivery", 
    status: "Canceled" 
  },
  { 
    id: "#34304", 
    image: "assets/apple.png",
    product: "Bag", 
    customer: "Brad Mason", 
    date: "06/09/2022", 
    amount: "$899.95", 
    payment: "Transfer Bank", 
    status: "Process" 
  },
];

const ClientComponent = () => {
  return (
    <motion.div 
      className="mt-5 bg-white p-6 rounded-xl shadow-sm border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Recent Rental Products</h2>
        <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">
          View All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left p-3 text-sm font-medium text-gray-500 uppercase tracking-wider">Tracking ID</th>
              <th className="text-left p-3 text-sm font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="text-left p-3 text-sm font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="text-left p-3 text-sm font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="text-left p-3 text-sm font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="text-left p-3 text-sm font-medium text-gray-500 uppercase tracking-wider">Payment</th>
              <th className="text-left p-3 text-sm font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left p-3 text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rentalProducts.map((item, index) => (
              <motion.tr 
                key={item.id}
                className="hover:bg-gray-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                whileHover={{ backgroundColor: "#f9fafb" }}
              >
                <td className="p-3 text-sm text-gray-900">{item.id}</td>
                <td className="p-3">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden bg-gray-100 mr-3">
                      <img 
                        src={item.image} 
                        alt={item.product}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{item.product}</span>
                  </div>
                </td>
                <td className="p-3 text-sm text-gray-500">{item.customer}</td>
                <td className="p-3 text-sm text-gray-500">{item.date}</td>
                <td className="p-3 text-sm font-medium text-gray-900">{item.amount}</td>
                <td className="p-3 text-sm text-gray-500">{item.payment}</td>
                <td className="p-3">
                  <div className="flex items-center">
                    {item.status === "Delivered" && (
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-xs text-green-800">Delivered</span>
                      </div>
                    )}
                    {item.status === "Process" && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-xs text-yellow-800">Processing</span>
                      </div>
                    )}
                    {item.status === "Canceled" && (
                      <div className="flex items-center">
                        <XCircle className="h-4 w-4 text-red-500 mr-1" />
                        <span className="text-xs text-red-800">Canceled</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex space-x-2">
                    <motion.button 
                      className="p-1 rounded-md hover:bg-blue-50 text-blue-500"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Edit className="h-4 w-4" />
                    </motion.button>
                    <motion.button 
                      className="p-1 rounded-md hover:bg-red-50 text-red-500"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of <span className="font-medium">5</span> results
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Previous
          </button>
          <button className="px-3 py-1 rounded-md bg-teal-600 text-sm font-medium text-white hover:bg-teal-700">
            1
          </button>
          <button className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ClientComponent;