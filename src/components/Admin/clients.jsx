import { CheckCircle, XCircle, Clock, Edit, Trash2 } from "lucide-react";

const rentalProducts = [
        { id: "#20462",image:"assets/apple.png" , product: "Hat", customer: "Matt Dickerson", date: "13/05/2022", amount: "$4.95", payment: "Transfer Bank", status: "Delivered" },
        { id: "#18933", image:"assets/apple.png" ,product: "Laptop", customer: "Wiktoria", date: "22/05/2022", amount: "$8.95", payment: "Cash on Delivery", status: "Delivered" },
        { id: "#45169", image:"assets/apple.png" ,product: "Phone", customer: "Trixie Byrd", date: "15/06/2022", amount: "$11,149.95", payment: "Cash on Delivery", status: "Process" },
        { id: "#17188", image:"assets/apple.png" ,product: "Headset", customer: "Sanderson", date: "25/09/2022", amount: "$22.95", payment: "Cash on Delivery", status: "Canceled" },
        { id: "#34304", image:"assets/apple.png" ,product: "Bag", customer: "Brad Mason", date: "06/09/2022", amount: "$899.95", payment: "Transfer Bank", status: "Process" },
    ];

const ClientComponent =()=>{


    return(

<div className="mt-5 bg-white p-5 shadow-md rounded-lg">
                        <h2 className="text-xl font-semibold">Recent Rental Products</h2>
                        <table className="w-full mt-3 border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2">Tracking ID</th>
                                    <th className="text-left p-2">Product</th>
                                    <th className="text-left p-2">Customer</th>
                                    <th className="text-left p-2">Date</th>
                                    <th className="text-left p-2">Amount</th>
                                    <th className="text-left p-2">Payment Mode</th>
                                    <th className="text-left p-2">Status</th>
                                    <th className="text-left p-2">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rentalProducts.map((item) => (
                                    <tr key={item.id} className="border-b">
                                        <td className="p-2">{item.id}</td>
                                        <td className="p-2  flex flex-1"><img src={item.image}></img>{item.product}</td>
                                        <td className="p-2">{item.customer}</td>
                                        <td className="p-2">{item.date}</td>
                                        <td className="p-2">{item.amount}</td>
                                        <td className="p-2">{item.payment}</td>
                                        <td className="p-2">
                                            {item.status === "Delivered" && <CheckCircle className="text-green-500" />}
                                            {item.status === "Process" && <Clock className="text-yellow-500" />}
                                            {item.status === "Canceled" && <XCircle className="text-red-500" />}
                                        </td>
                                        <td className="p-2 flex space-x-2">
                                            <Edit className="text-blue-500 cursor-pointer" />
                                            <Trash2 className="text-red-500 cursor-pointer" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
)
}

export default ClientComponent;