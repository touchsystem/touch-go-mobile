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
        yes: 'Sim',
        no: 'Não',
        ok: 'OK',
        close: 'Fechar',
        edit: 'Editar',
        delete: 'Excluir',
        remove: 'Remover',
        add: 'Adicionar',
        update: 'Atualizar',
        success: 'Sucesso',
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
        user: 'Usuário',
        logout: 'Sair do Sistema',
        logoutConfirm: 'Deseja realmente sair? Você precisará fazer login novamente.',
        logoutCancel: 'Cancelar',
        mode: 'Modo',
        system: 'Sistema',
        dark: 'Escuro',
        light: 'Claro',
        levelNames: {
            1: 'Garçom',
            2: 'Caixa',
            3: 'Supervisor',
            4: 'Gerente',
            5: 'Administrador',
            6: 'Suporte',
        },
        level: 'Nível {{level}}',
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
        save: 'Salvar',
        language: 'Idioma',
        saveSuccess: 'Configurações salvas com sucesso!',
        saveError: 'Erro ao salvar configurações',
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
        item: 'item',
        itemPlural: 'itens',
        quantity: 'Quantidade',
        price: 'Preço',
        subtotal: 'Subtotal',
        discount: 'Desconto',
        payment: 'Pagamento',
        confirm: 'Confirmar Pedido',
        cancel: 'Cancelar Pedido',
        orderSent: 'Pedido enviado com sucesso',
        orderError: 'Erro ao enviar pedido',
        selectTable: 'Selecionar Mesa',
        noTableSelected: 'Nenhuma mesa selecionada',
        emptyCart: 'Carrinho vazio',
        emptyCartMessage: 'Adicione produtos ao carrinho para continuar.',
        total: 'Total',
        totalLabel: 'Total:',
        confirmOrder: 'Confirmar Pedido',
        confirmOrderMessage: 'Deseja enviar o pedido para a Mesa {{table}}?',
        sendOrder: 'Enviar Pedido',
        sendOrderTitle: 'Enviar Pedido - {{total}}',
        clearCart: 'Limpar Carrinho',
        editItem: 'Editar Item',
        deleteItem: 'Remover Item',
        addObservation: 'Adicionar Observação',
        observation: 'Observação',
        itemAdded: 'Item adicionado ao carrinho',
        itemUpdated: 'Item atualizado',
        itemRemoved: 'Item removido do carrinho',
        userNotFound: 'Usuário não encontrado. Configure o usuário no perfil.',
        orderSentSuccess: 'Pedido enviado!',
        changeTable: 'Trocar Mesa',
        changeTableMessage: 'Deseja trocar a mesa selecionada?',
        change: 'Trocar',
        user: 'Usuário',
        notAvailable: 'N/A',
    },

    // ViewBillModal
    viewBill: {
        error: 'Erro',
        errorLoadingBill: 'Erro ao carregar conta da mesa',
        userNotFound: 'Usuário não encontrado. Configure o usuário no perfil.',
        print: 'Imprimir',
        pay: 'Pagar',
        close: 'Fechar',
        table: 'Mesa',
        total: 'Total',
        paymentSuccess: 'Pagamento realizado com sucesso.',
        paymentError: 'Falha no pagamento. Tente novamente.',
        paymentTimeout: 'Tempo máximo estipulado para a operação expirou. Por favor, tente novamente.',
        paymentNotAvailable: 'Pagamento no terminal não disponível. Use o app em um dispositivo com PagSeguro Smart 2.',
        awaitingCard: 'Aguardando cartão...',
        selectPaymentMethod: 'Selecione o método de pagamento',
        credit: 'Crédito',
        debit: 'Débito',
        pix: 'Pix',
        closeFailedPrintHint: 'O sistema exige que a conta seja impressa antes de fechar. Imprima a conta no computador do caixa e feche a mesa por lá, ou verifique a impressora de rede.',
    },

    // Products
    products: {
        title: 'Produtos',
        search: 'Buscar produtos...',
        categories: 'Categorias',
        all: 'Todos',
        addToCart: 'Adicionar ao Carrinho',
        outOfStock: 'Fora de estoque',
        noResults: 'Nenhum produto encontrado',
        noProducts: 'Nenhum produto disponível',
    },

    // SearchProducts
    searchProducts: {
        title: 'Pesquisar Produtos',
    },

    // ProductGroups
    productGroups: {
        title: 'Grupos de Produtos',
    },

    // Errors
    errors: {
        connection: 'Erro de conexão. Verifique sua conexão com a internet.',
        server: 'Erro no servidor. Tente novamente mais tarde.',
        unknown: 'Ocorreu um erro desconhecido.',
        required: 'Este campo é obrigatório',
        invalid: 'Valor inválido',
        fillEmailPassword: 'Preencha email e senha',
        loginError: 'Erro ao fazer login',
        saveSettingsError: 'Erro ao salvar configurações',
    },

    // Success messages
    success: {
        saved: 'Configurações salvas com sucesso',
        orderSent: 'Pedido enviado com sucesso',
        userChanged: 'Usuário alterado para: {{nick}}',
        settingsSaved: 'Configurações salvas com sucesso!',
    },

    // Login
    login: {
        email: 'Email',
        emailPlaceholder: 'seu@email.com',
        password: 'Senha',
        rememberMe: 'Lembrar-me',
        forgotPassword: 'Esqueceu a senha?',
        welcome: 'Bem-vindo',
        subtitle: 'Entre com suas credenciais',
        support: 'Suporte',
        help: 'Ajuda',
    },


    // Bills
    bills: {
        title: 'Contas',
        searchPlaceholder: 'Buscar mesa por número...',
        emptyTables: 'Nenhuma mesa encontrada',
        table: 'Mesa',
        total: 'Total',
        viewBill: 'Ver Conta',
        noTables: 'Nenhuma mesa disponível',
        warning: 'Aviso',
        noOrdersMessage: 'Esta mesa não possui pedidos. Apenas mesas ocupadas ou fechadas podem ter contas.',
        status: {
            free: 'Livre',
            occupied: 'Ocupada',
            reserved: 'Reservada',
            closed: 'Fechada',
            inactive: 'Inativa',
        },
    },

    // Menu
    menu: {
        title: 'Cardápio',
        emptyGroups: 'Nenhum grupo encontrado',
        emptyGroupsMessage: 'Não há grupos de produtos disponíveis no momento.',
    },
};
