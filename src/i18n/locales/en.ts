export default {
    // Common
    common: {
        loading: 'Loading...',
        error: 'An error occurred',
        retry: 'Try again',
        cancel: 'Cancel',
        save: 'Save',
        confirm: 'Confirm',
        back: 'Back',
        next: 'Next',
        search: 'Search',
        noResults: 'No results found',
    },

    // Auth
    auth: {
        login: 'Login',
        logout: 'Logout',
        username: 'Username',
        password: 'Password',
        loginError: 'Incorrect username or password',
        sessionExpired: 'Session expired. Please log in again.',
    },

    // Navigation
    navigation: {
        home: 'Home',
        products: 'Products',
        orders: 'Orders',
        profile: 'Profile',
        settings: 'Settings',
    },

    // Profile
    profile: {
        title: 'Profile',
        changeUser: 'Change User',
        appearance: 'Appearance',
        theme: 'Theme',
        language: 'Language',
        about: 'About',
        version: 'Version',
    },

    // Settings
    settings: {
        title: 'Settings',
        serverAndConnection: 'Server and Connection',
        interface: 'Interface and Display',
        sales: 'Sales and Orders',
        commands: 'Orders and Printing',
        cards: 'Cards and Tables',
        cashier: 'Cashier and Accounts',
        equipment: 'Equipment and Integrations',

        // Server settings
        serverIp: 'Server IP',
        serverPort: 'Port',
        equipmentNumber: 'Equipment Number',

        // Interface settings
        landscapeScreen: 'Landscape Mode',
        showBorder: 'Show Border',
        showTourist: 'Show Tourist',

        // Sales settings
        directSale: 'Direct Sale',
        directReceiptWithCard: 'Direct Receipt with Card',
        directEntry: 'Direct Entry',
        groupQuantityInOrder: 'Group Quantity in Order',

        // Command settings
        secondCopyOrder: 'Second Order Copy',
        summarizedOrder: 'Summarized Order',
        secondCopyDetailedBill: 'Second Detailed Bill Copy',
        printAccounts: 'Print Accounts',
        secondTableOrder: 'Second Table Order',

        // Card settings
        cardOpening: 'Card Opening',
        mandatoryFieldsCardOpening: 'Mandatory Card Opening Fields',
        nfcCard: 'NFC Card',

        // Cashier settings
        cashierSetting: 'Cashier',
        removeAccountOptions: 'Remove Account Options',
        removeCashierAccount: 'Remove Cashier Account',
        hideAnticipation: 'Hide Anticipation',

        // Equipment settings
        scale: 'Scale',
        bar2: 'Bar2',
        emitWebenefixInvoice: 'Issue Webenefix Invoice',

        // Actions
        paymentMethods: 'PAYMENT METHODS',
        saveSettings: 'SAVE',
    },

    // Payment Methods
    paymentMethods: {
        title: 'Payment Methods',
        enabledMethods: 'Enabled Payment Methods',
    },

    // Orders
    orders: {
        title: 'Orders',
        newOrder: 'New Order',
        table: 'Table',
        status: 'Status',
        items: 'Items',
        quantity: 'Quantity',
        price: 'Price',
        subtotal: 'Subtotal',
        discount: 'Discount',
        payment: 'Payment',
        confirm: 'Confirm Order',
        cancel: 'Cancel Order',
        orderSent: 'Order sent successfully',
        orderError: 'Error sending order',
    },

    // Products
    products: {
        title: 'Products',
        search: 'Search products...',
        categories: 'Categories',
        all: 'All',
        addToCart: 'Add to Cart',
        outOfStock: 'Out of stock',
    },

    // Errors
    errors: {
        connection: 'Connection error. Please check your internet connection.',
        server: 'Server error. Please try again later.',
        unknown: 'An unknown error occurred.',
        required: 'This field is required',
        invalid: 'Invalid value',
    },

    // Success messages
    success: {
        saved: 'Settings saved successfully',
        orderSent: 'Order sent successfully',
    },
};