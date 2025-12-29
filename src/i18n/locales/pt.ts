export default {
    // Common
    common: {
        loading: 'Carregando...',
        error: 'Ocorreu um erro',
        retry: 'Tentar novamente',
        cancel: 'Cancelar',
        save: 'Salvar',
        confirm: 'Confirmar',
        back: 'Voltar',
        next: 'Próximo',
        search: 'Pesquisar',
        noResults: 'Nenhum resultado encontrado',
    },

    // Auth
    auth: {
        login: 'Entrar',
        logout: 'Sair',
        username: 'Usuário',
        password: 'Senha',
        loginError: 'Usuário ou senha incorretos',
        sessionExpired: 'Sessão expirada. Por favor faça login novamente.',
    },

    // Navigation
    navigation: {
        home: 'Início',
        products: 'Produtos',
        orders: 'Pedidos',
        profile: 'Perfil',
        settings: 'Configurações',
    },

    // Profile
    profile: {
        title: 'Perfil',
        changeUser: 'Trocar Usuário',
        appearance: 'Aparência',
        theme: 'Tema',
        language: 'Idioma',
        about: 'Sobre',
        version: 'Versão',
    },

    // Settings
    settings: {
        title: 'Configurações',
        serverAndConnection: 'Servidor e Conexão',
        interface: 'Interface e Visualização',
        sales: 'Vendas e Pedidos',
        commands: 'Comandas e Impressão',
        cards: 'Cartões e Mesas',
        cashier: 'Caixa e Contas',
        equipment: 'Equipamentos e Integrações',

        // Server settings
        serverIp: 'IP do Servidor',
        serverPort: 'Porta',
        equipmentNumber: 'Número do Equipamento',

        // Interface settings
        landscapeScreen: 'Tela Deitada',
        showBorder: 'Mostrar Borda',
        showTourist: 'Mostrar Turista',

        // Sales settings
        directSale: 'Venda Direta',
        directReceiptWithCard: 'Recebimento Direta com Cartão',
        directEntry: 'Entrada Direta',
        groupQuantityInOrder: 'Agrupar Quantidade no Pedido',

        // Command settings
        secondCopyOrder: 'Segunda via Comanda',
        summarizedOrder: 'Comanda Resumida',
        secondCopyDetailedBill: 'Segunda via Conta Detalhada',
        printAccounts: 'Impressão de Contas',
        secondTableOrder: 'Segunda Comanda Mesa',

        // Card settings
        cardOpening: 'Abertura Cartão',
        mandatoryFieldsCardOpening: 'Campos Obrigatórios Abertura Cartão',
        nfcCard: 'Cartão NFC',

        // Cashier settings
        cashierSetting: 'Caixa',
        removeAccountOptions: 'Remover as Opções de Contas',
        removeCashierAccount: 'Remover Conta Caixa',
        hideAnticipation: 'Ocultar Antecipação',

        // Equipment settings
        scale: 'Balança',
        bar2: 'Bar2',
        emitWebenefixInvoice: 'Emitir Nota Fiscal Webenefix',

        // Actions
        paymentMethods: 'MÉTODOS DE PAGAMENTO',
        saveSettings: 'SALVAR',
    },

    // Payment Methods
    paymentMethods: {
        title: 'Métodos de Pagamento',
        enabledMethods: 'Métodos de Pagamento Habilitados',
    },

    // Orders
    orders: {
        title: 'Pedidos',
        newOrder: 'Novo Pedido',
        table: 'Mesa',
        status: 'Status',
        items: 'Itens',
        quantity: 'Quantidade',
        price: 'Preço',
        subtotal: 'Subtotal',
        discount: 'Desconto',
        payment: 'Pagamento',
        confirm: 'Confirmar Pedido',
        cancel: 'Cancelar Pedido',
        orderSent: 'Pedido enviado com sucesso',
        orderError: 'Erro ao enviar pedido',
    },

    // Products
    products: {
        title: 'Produtos',
        search: 'Buscar produtos...',
        categories: 'Categorias',
        all: 'Todos',
        addToCart: 'Adicionar ao Carrinho',
        outOfStock: 'Fora de estoque',
    },

    // Errors
    errors: {
        connection: 'Erro de conexão. Verifique sua conexão com a internet.',
        server: 'Erro no servidor. Tente novamente mais tarde.',
        unknown: 'Ocorreu um erro desconhecido.',
        required: 'Este campo é obrigatório',
        invalid: 'Valor inválido',
    },

    // Success messages
    success: {
        saved: 'Configurações salvas com sucesso',
        orderSent: 'Pedido enviado com sucesso',
    },
};
