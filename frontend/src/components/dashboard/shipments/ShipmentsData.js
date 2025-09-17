// Dummy data (replace later with API)
const shipmentsData = [
        { 
            id: "SHP-1001",
            description: "Truck #A12 - 18-Wheeler",
            status: "delivered",
            driverName: "Ali Hassan",
            driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />,
            currentLocation: "Islamabad",
            capacity: "85%",
            driverId: "DRV-001",
            weight: "12000 Kg",
            cargoType: "Electronics",
            origin: "Karachi",
            destination: "Islamabad",
            paymentStatus: "Paid",
            eta: "27/07/25 at 1:00 PM",
            trackingHistory: [
                { status: "Order Received", time: "25/07/25 09:00 AM" },
                { status: "On Route", time: "25/07/25 01:00 PM" },
                { status: "Departure", time: "26/07/25 08:00 AM" },
            ], 
        },
        { 
            id: "SHP-1002",
            description: "Truck #B07 - Flatbed",
            status: "pending",
            driverName: "Ahmed",
            driverAvatar: <img src="/images/avatar2.png" alt="Avatar 2" />,
            currentLocation: "Karachi",
            shippingCode: "CODE-1002",
            capacity: "80%",
            driverId: "DRV-002",
            weight: "8000 Kg",
            cargoType: "Steel",
            origin: "Lahore",
            destination: "Karachi",
            paymentStatus: "Unpaid",
            eta: "28/07/25 at 5:30 PM",
            trackingHistory: [
                { status: "Order Received", time: "25/07/25 10:30 AM" },
                { status: "On Route", time: "25/07/25 01:00 PM" },
                { status: "Departure", time: "26/07/25 08:00 AM" },
            ],
        },
        { 
            id: "SHP-1003",
            description: "Truck #C45 - Container",
            status: "pending", driverName: "Saad",
            driverAvatar: <img src="/images/avatar3.png" alt="Avatar 3" />,
            currentLocation: "Lahore",
            shippingCode: "CODE-1003",
            capacity: "20%",
            driverId: "DRV-002",
            weight: "8000 Kg",
            cargoType: "Steel",
            origin: "Lahore",
            destination: "Karachi",
            paymentStatus: "Unpaid",
            eta: "28/07/25 at 5:30 PM",
            trackingHistory: [
                { status: "Order Received", time: "25/07/25 10:30 AM" },
                { status: "On Route", time: "25/07/25 01:00 PM" },
                { status: "Departure", time: "26/07/25 08:00 AM" },
            ],
        },
        { id: "SHP-1004", description: "Truck #C45 - Container", status: "in transit", driverName: "Ali Khan", driverAvatar: <img src="/images/avatar4.png" alt="Avatar 4" />, currentLocation: "Multan" },
        { id: "SHP-1005", description: "Truck #B07 - Flatbed", status: "delivered", driverName: "Hassan", driverAvatar: <img src="/images/avatar5.png" alt="Avatar 5" />, currentLocation: "Faislabad" },
        { id: "SHP-1006", description: "Truck #G32 - Pickup", status: "delivered", driverName: "Kamran", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Karachi" },
        { id: "SHP-1007", description: "Truck #H04 - Trailer", status: "pending", driverName: "Bilal Ahmed", driverAvatar: <img src="/images/avatar2.png" alt="Avatar 2" />, currentLocation: "Lahore" },
        { id: "SHP-1008", description: "Truck #B07 - Flatbed", status: "in transit", driverName: "Ali Khan", driverAvatar: <img src="/images/avatar3.png" alt="Avatar 3" />, currentLocation: "Islamabad" },
        { id: "SHP-1009", description: "Truck #D89 - Refrigerated", status: "delivered", driverName: "Ali Khan", driverAvatar: <img src="/images/avatar4.png" alt="Avatar 4" />, currentLocation: "Gujranwala" },
        { id: "SHP-1010", description: "Truck #E12 - Box Truck", status: "pending", driverName: "Ali Khan", driverAvatar: <img src="/images/avatar5.png" alt="Avatar 5" />, currentLocation: "Lahore" },
        { id: "SHP-1011", description: "Truck #F34 - Tanker", status: "in transit", driverName: "Usama Khan", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Islamabad" },
        { id: "SHP-1012", description: "Truck #G56 - Dump Truck", status: "delivered", driverName: "Usman", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Islamabad" },
        { id: "SHP-1013", description: "Truck #H78 - Semi Trailer", status: "pending", driverName: "Khan", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Islamabad" },
        { id: "SHP-1014", description: "Truck #I90 - Cargo Van", status: "in transit", driverName: "Ali", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Islamabad" },
        { id: "SHP-1015", description: "Truck #J12 - Livestock Trailer", status: "delivered", driverName: "Saad", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Lahore" },
        { id: "SHP-10016", description: "Truck #B07 - Flatbed", status: "in transit", driverName: "Ali Hassan", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Islamabad" },
        { id: "SHP-10017", description: "Truck #D89 - Refrigerated", status: "delivered", driverName: "Usama Khan", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Islamabad" },
        { id: "SHP-1018", description: "Truck #E12 - Box Truck", status: "pending", driverName: "Ali", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Islamabad" },
        { id: "SHP-1019", description: "Truck #F34 - Tanker", status: "in transit", driverName: "Hassan", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Islamabad" },
        { id: "SHP-1020", description: "Truck #G56 - Dump Truck", status: "delivered", driverName: "Usman", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Islamabad" },
        { id: "SHP-1021", description: "Truck #H78 - Semi Trailer", status: "pending", driverName: "Ahmad", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Islamabad" },
        { id: "SHP-1022", description: "Truck #I90 - Cargo Van", status: "in transit", driverName: "Usama Khan", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Islamabad" },
        { id: "SHP-1023", description: "Truck #J12 - Livestock Trailer", status: "delivered", driverName: "Hadi Khan", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Lahore" }
    ];


    // Placeholder for API call
    //useEffect(() => {
        //const fetchShipments = async () => {
          //  try {
                // Example API call (uncomment & replace when backend ready)
                // const response = await fetch("/api/shipments");
                // const data = await response.json();
                // setShipments(data);

            //    console.log("API call placeholder - shipments");

            //} catch (error) {
              //  console.error("Error fetching shipments:", error);
            //}
        //};

        //fetchShipments();
   // }, []);


    export default shipmentsData;