export default {
    // Common
    common: {
        loading: 'Cargando...',
        error: 'Ocurrió un error',
        success: 'Éxito',
        cancel: 'Cancelar',
        confirm: 'Confirmar',
        save: 'Guardar',
        edit: 'Editar',
        delete: 'Eliminar',
        search: 'Buscar',
        noResults: 'No se encontraron resultados',
        back: 'Atrás',
        next: 'Siguiente',
        finish: 'Finalizar',
        close: 'Cerrar',
        ok: 'Aceptar',
        yes: 'Sí',
        no: 'No',
        retry: 'Reintentar',
        connectionError: 'Error de conexión',
        serverError: 'Error del servidor',
        unknownError: 'Error desconocido',
        requiredField: 'Campo obligatorio',
        invalidFormat: 'Formato inválido',
        noInternet: 'Sin conexión a Internet',
        tryAgain: 'Intente nuevamente',
        noData: 'No hay datos disponibles',
        loadingData: 'Cargando datos...',
        updating: 'Actualizando...',
        updated: '¡Actualizado!',
        saved: '¡Guardado!',
        deleted: '¡Eliminado!',
        processing: 'Procesando...',
        select: 'Seleccionar',
        all: 'Todos',
        none: 'Ninguno',
        apply: 'Aplicar',
        reset: 'Restablecer',
        filter: 'Filtrar',
        sort: 'Ordenar',
        more: 'Más',
        less: 'Menos',
        showMore: 'Mostrar más',
        showLess: 'Mostrar menos',
        and: 'y',
    },

    // Auth
    auth: {
        login: 'Iniciar sesión',
        logout: 'Cerrar sesión',
        username: 'Usuario',
        password: 'Contraseña',
        loginError: 'Usuario o contraseña incorrectos',
        sessionExpired: 'Sesión expirada. Por favor inicie sesión nuevamente.',
    },

    // Navigation
    navigation: {
        home: 'Inicio',
        products: 'Productos',
        orders: 'Pedidos',
        profile: 'Perfil',
        settings: 'Configuración',
    },

    // Profile
    profile: {
        title: 'Perfil',
        changeUser: 'Cambiar usuario',
        appearance: 'Apariencia',
        theme: 'Tema',
        language: 'Idioma',
        about: 'Acerca de',
        version: 'Versión',
    },

    // Settings
    settings: {
        title: 'Configuración',
        serverAndConnection: 'Servidor y Conexión',
        interface: 'Interfaz y Visualización',
        sales: 'Ventas y Pedidos',
        commands: 'Comandas e Impresión',
        cards: 'Tarjetas y Mesas',
        cashier: 'Caja y Cuentas',
        equipment: 'Equipos e Integraciones',

        // Server settings
        serverIp: 'IP del Servidor',
        serverPort: 'Puerto',
        equipmentNumber: 'Número de Equipo',

        // Interface settings
        landscapeScreen: 'Pantalla Horizontal',
        showBorder: 'Mostrar Borde',
        showTourist: 'Mostrar Turista',
        language: 'Idioma',

        // Sales settings
        directSale: 'Venta Directa',
        directReceiptWithCard: 'Recibo Directo con Tarjeta',
        directEntry: 'Entrada Directa',
        groupQuantityInOrder: 'Agrupar Cantidad en Pedido',

        // Command settings
        secondCopyOrder: 'Segunda Vía Comanda',
        summarizedOrder: 'Comanda Resumida',
        secondCopyDetailedBill: 'Segunda Vía Cuenta Detallada',
        printAccounts: 'Impresión de Cuentas',
        secondTableOrder: 'Segunda Vía Mesa',

        // Card settings
        cardOpening: 'Apertura de Tarjeta',
        mandatoryFieldsCardOpening: 'Campos Obligatorios Apertura Tarjeta',
        nfcCard: 'Tarjeta NFC',

        // Cashier settings
        cashierSetting: 'Caja',
        removeAccountOptions: 'Opciones de Eliminación de Cuenta',
        removeCashierAccount: 'Eliminar Cuenta de Caja',
        hideAnticipation: 'Ocultar Anticipo',

        // Equipment settings
        scale: 'Balanza',
        bar2: 'Barra 2',
        emitWebenefixInvoice: 'Emitir Factura Webenefix',

        // Actions
        paymentMethods: 'MÉTODOS DE PAGO',
        saveSettings: 'GUARDAR',
        saveSuccess: 'Configuración guardada correctamente',
        saveError: 'Error al guardar la configuración',
    },

    // Payment Methods
    paymentMethods: {
        title: 'Métodos de Pago',
        enabledMethods: 'Métodos de Pago Habilitados',
    },

    // Orders
    orders: {
        title: 'Pedidos',
        newOrder: 'Nuevo Pedido',
        table: 'Mesa',
        status: 'Estado',
        items: 'Artículos',
        quantity: 'Cantidad',
        price: 'Precio',
        subtotal: 'Subtotal',
        discount: 'Descuento',
        payment: 'Pago',
        confirm: 'Confirmar Pedido',
        orderSent: 'Pedido enviado con éxito',
        orderError: 'Error al enviar pedido',
    },

    // Success messages
    success: {
        saved: 'Configuración guardada correctamente',
        orderSent: 'Pedido enviado con éxito',
        userChanged: 'Usuario cambiado a: {{nick}}',
        settingsSaved: 'Configuración guardada correctamente!',
    },

    // Errors
    errors: {
        connection: 'Error de conexión. Verifique su conexión con Internet.',
        server: 'Error del servidor. Intente nuevamente más tarde.',
        unknown: 'Ocurrió un error desconocido.',
        required: 'Este campo es obligatorio',
        invalid: 'Valor inválido',
        fillEmailPassword: 'Complete el correo electrónico y la contraseña',
        loginError: 'Error al iniciar sesión',
        saveSettingsError: 'Error al guardar configuración',
    },

    // Login
    login: {
        email: 'Correo electrónico',
        emailPlaceholder: 'tu@email.com',
        password: 'Contraseña',
        rememberMe: 'Recordarme',
        forgotPassword: '¿Olvidaste la contraseña?',
        welcome: 'Bienvenido',
        subtitle: 'Ingrese sus credenciales',
        support: 'Soporte',
        help: 'Ayuda',
    },

    // Profile
    profile: {
        user: 'Usuario',
        logout: 'Cerrar Sesión',
        logoutConfirm: '¿Realmente desea cerrar sesión? Necesitará iniciar sesión nuevamente.',
        logoutCancel: 'Cancelar',
        mode: 'Modo',
        system: 'Sistema',
        dark: 'Oscuro',
        light: 'Claro',
        levelNames: {
            1: 'Camarero',
            2: 'Cajero',
            3: 'Supervisor',
            4: 'Gerente',
            5: 'Administrador',
            6: 'Soporte',
        },
        level: 'Nivel {{level}}',
    },

    // Bills
    bills: {
        title: 'Cuentas',
        searchPlaceholder: 'Buscar mesa por número...',
        emptyTables: 'No se encontraron mesas',
        table: 'Mesa',
        total: 'Total',
        viewBill: 'Ver Cuenta',
        noTables: 'No hay mesas disponibles',
        warning: 'Advertencia',
        noOrdersMessage: 'Esta mesa no tiene pedidos. Solo las mesas ocupadas o cerradas pueden tener cuentas.',
        status: {
            free: 'Libre',
            occupied: 'Ocupada',
            reserved: 'Reservada',
            closed: 'Cerrada',
            inactive: 'Inactiva',
        },
    },

    // Menu
    menu: {
        title: 'Menú',
        emptyGroups: 'No se encontraron grupos',
        emptyGroupsMessage: 'No hay grupos de productos disponibles en este momento.',
    },

    // Orders
    orders: {
        title: 'Pedidos',
        newOrder: 'Nuevo Pedido',
        table: 'Mesa',
        status: 'Estado',
        items: 'Artículos',
        item: 'artículo',
        itemPlural: 'artículos',
        quantity: 'Cantidad',
        price: 'Precio',
        subtotal: 'Subtotal',
        discount: 'Descuento',
        payment: 'Pago',
        confirm: 'Confirmar Pedido',
        cancel: 'Cancelar Pedido',
        orderSent: 'Pedido enviado con éxito',
        orderError: 'Error al enviar pedido',
        selectTable: 'Seleccionar Mesa',
        noTableSelected: 'Ninguna mesa seleccionada',
        emptyCart: 'Carrito vacío',
        emptyCartMessage: 'Agregue productos al carrito para continuar.',
        total: 'Total',
        totalLabel: 'Total:',
        confirmOrder: 'Confirmar Pedido',
        confirmOrderMessage: '¿Desea enviar el pedido a la Mesa {{table}}?',
        sendOrder: 'Enviar Pedido',
        sendOrderTitle: 'Enviar Pedido - {{total}}',
        clearCart: 'Vaciar Carrito',
        editItem: 'Editar Artículo',
        deleteItem: 'Eliminar Artículo',
        addObservation: 'Agregar Observación',
        observation: 'Observación',
        itemAdded: 'Artículo agregado al carrito',
        itemUpdated: 'Artículo actualizado',
        itemRemoved: 'Artículo eliminado del carrito',
        userNotFound: 'Usuario no encontrado. Configure el usuario en el perfil.',
        orderSentSuccess: '¡Pedido enviado!',
        changeTable: 'Cambiar Mesa',
        changeTableMessage: '¿Desea cambiar la mesa seleccionada?',
        change: 'Cambiar',
        user: 'Usuario',
        notAvailable: 'N/A',
    },

    // Settings
    settings: {
        language: 'Idioma',
        saveSuccess: 'Configuración guardada correctamente!',
        saveError: 'Error al guardar configuración',
    },

    // Common
    common: {
        yes: 'Sí',
        no: 'No',
        ok: 'Aceptar',
        close: 'Cerrar',
        edit: 'Editar',
        delete: 'Eliminar',
        remove: 'Quitar',
        add: 'Agregar',
        update: 'Actualizar',
        total: 'Total',
        subtotal: 'Subtotal',
        quantity: 'Cantidad',
        item: 'Artículo',
        items: 'Artículos',
    },
};
