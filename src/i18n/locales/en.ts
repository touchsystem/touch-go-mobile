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
        yes: 'Yes',
        no: 'No',
        ok: 'OK',
        close: 'Close',
        edit: 'Edit',
        delete: 'Delete',
        remove: 'Remove',
        add: 'Add',
        update: 'Update',
        success: 'Success',
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
        user: 'User',
        logout: 'Logout',
        logoutConfirm: 'Do you really want to logout? You will need to login again.',
        logoutCancel: 'Cancel',
        mode: 'Mode',
        system: 'System',
        dark: 'Dark',
        light: 'Light',
        levelNames: {
            1: 'Waiter',
            2: 'Cashier',
            3: 'Supervisor',
            4: 'Manager',
            5: 'Administrator',
            6: 'Support',
        },
        level: 'Level {{level}}',
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
        save: 'Save',
        language: 'Language',
        saveSuccess: 'Settings saved successfully!',
        saveError: 'Error saving settings',
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
        item: 'item',
        itemPlural: 'items',
        quantity: 'Quantity',
        price: 'Price',
        subtotal: 'Subtotal',
        discount: 'Discount',
        payment: 'Payment',
        confirm: 'Confirm Order',
        cancel: 'Cancel Order',
        orderSent: 'Order sent successfully',
        orderError: 'Error sending order',
        selectTable: 'Select Table',
        noTableSelected: 'No table selected',
        emptyCart: 'Empty cart',
        emptyCartMessage: 'Add products to cart to continue.',
        total: 'Total',
        totalLabel: 'Total:',
        confirmOrder: 'Confirm Order',
        confirmOrderMessage: 'Do you want to send the order to Table {{table}}?',
        sendOrder: 'Send Order',
        sendOrderTitle: 'Send Order - {{total}}',
        clearCart: 'Clear Cart',
        editItem: 'Edit Item',
        deleteItem: 'Remove Item',
        addObservation: 'Add Observation',
        observation: 'Observation',
        itemAdded: 'Item added to cart',
        itemUpdated: 'Item updated',
        itemRemoved: 'Item removed from cart',
        userNotFound: 'User not found. Configure the user in the profile.',
        orderSentSuccess: 'Order sent!',
        changeTable: 'Change Table',
        changeTableMessage: 'Do you want to change the selected table?',
        change: 'Change',
        user: 'User',
        notAvailable: 'N/A',
    },

    // Products
    products: {
        title: 'Products',
        search: 'Search products...',
        categories: 'Categories',
        all: 'All',
        addToCart: 'Add to Cart',
        outOfStock: 'Out of stock',
        noResults: 'No products found',
        noProducts: 'No products available',
    },

    // SearchProducts
    searchProducts: {
        title: 'Search Products',
    },

    // ProductGroups
    productGroups: {
        title: 'Product Groups',
    },

    // ViewBillModal
    viewBill: {
        error: 'Error',
        errorLoadingBill: 'Error loading table bill',
        userNotFound: 'User not found. Configure the user in the profile.',
        print: 'Print',
        pay: 'Pay',
        close: 'Close',
        table: 'Table',
        total: 'Total',
        paymentSuccess: 'Payment completed successfully.',
        paymentError: 'Payment failed. Please try again.',
        paymentTimeout: 'Maximum time stipulated for the operation has expired. Please try again.',
        paymentNotAvailable: 'Terminal payment not available. Use the app on a device with PagSeguro Smart 2.',
        awaitingCard: 'Awaiting card...',
        selectPaymentMethod: 'Select payment method',
        credit: 'Credit',
        debit: 'Debit',
        pix: 'Pix',
        closeFailedPrintHint: 'The system requires the bill to be printed before closing. Print the bill on the cashier computer and close the table there, or check the network printer.',
    },

    // Errors
    errors: {
        connection: 'Connection error. Please check your internet connection.',
        server: 'Server error. Please try again later.',
        unknown: 'An unknown error occurred.',
        required: 'This field is required',
        invalid: 'Invalid value',
        fillEmailPassword: 'Please fill email and password',
        loginError: 'Error logging in',
        saveSettingsError: 'Error saving settings',
    },

    // Success messages
    success: {
        saved: 'Settings saved successfully',
        orderSent: 'Order sent successfully',
        userChanged: 'User changed to: {{nick}}',
        settingsSaved: 'Settings saved successfully!',
    },

    // Login
    login: {
        email: 'Email',
        emailPlaceholder: 'your@email.com',
        password: 'Password',
        rememberMe: 'Remember me',
        forgotPassword: 'Forgot password?',
        welcome: 'Welcome',
        subtitle: 'Enter your credentials',
        support: 'Support',
        help: 'Help',
    },

    // Bills
    bills: {
        title: 'Bills',
        searchPlaceholder: 'Search table by number...',
        emptyTables: 'No tables found',
        table: 'Table',
        total: 'Total',
        viewBill: 'View Bill',
        noTables: 'No tables available',
        warning: 'Warning',
        noOrdersMessage: 'This table has no orders. Only occupied or closed tables can have bills.',
        status: {
            free: 'Free',
            occupied: 'Occupied',
            reserved: 'Reserved',
            closed: 'Closed',
            inactive: 'Inactive',
        },
    },

    // Menu
    menu: {
        title: 'Menu',
        emptyGroups: 'No groups found',
        emptyGroupsMessage: 'No product groups available at the moment.',
    },
};