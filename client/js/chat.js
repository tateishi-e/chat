var app = new Vue({

    // Elemento que o aplicativo será iniciado
    el: "#app",

    // Propriedades do aplicativo
    data: {
        user: 'Anônimo',
        text: null,
        messages: [],
        ws: null,
        status: null,
        results: null,
        loading: false
    },

    // Quando iniciado o aplicativo
    created: function() {
        let user = localStorage.getItem(USER_KEY)

        if(!user)
            document.location.href = APP + "/account"

        this.user = user

        // Inicia a conexão com o websocket
        this.connect();
        axios.get("https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH&tsyms=USD,EUR").then(response => {
            this.results = response.data
        })
    },

    // Métodos do aplicatvo
    methods: {

        // Método responsável por iniciar conexão com o websocket
        connect: function(onOpen) {

            var self = this;

            // Conectando
            self.ws = new WebSocket('ws://localhost:8080?u=' + this.user);

            // Evento que será chamado ao abrir conexão
            self.ws.onopen = function() {
                self.addSuccessNotification('Conectado');
                // Se houver método de retorno
                if (onOpen) {
                    onOpen();
                }
            };

            // Evento que será chamado quando houver erro na conexão
            self.ws.onerror = function() {
                self.addErrorNotification('Não foi possível conectar-se ao servidor');
            };

            // Evento que será chamado quando recebido dados do servidor
            self.ws.onmessage = function(e) {

                let result = JSON.parse(e.data);
                
                if ((typeof result) !== "string") 
                    self.addMessage(result)
                else 
                    console.log(result)
            };

        },

        // Método responsável por adicionar uma mensagem de usuário
        addMessage: function(data) {
            this.messages.push(data);

            setTimeout(()=>{
                this.scrollDown();
             },50);
        },

        // Método responsável por adicionar uma notificação de sucesso
        addSuccessNotification: function(text) {
            this.status = {color: 'green', text: text};
        },

        // Método responsável por adicionar uma notificação de erro
        addErrorNotification: function(text) {
            this.status = {color: 'red', text: text};
        },

        // Método responsável por enviar uma mensagem
        sendMessage: function() {

            var self = this;

            // Se não houver o texto da mensagem ou o nome de usuário
            if (!self.text || !self.user || self.text.trim().length < 1) {
                // Saindo do método
                return;
            }

            // Se a conexão não estiver aberta
            if (self.ws.readyState !== self.ws.OPEN) {

                // Exibindo notificação de erro
                self.addErrorNotification('Problemas na conexão. Tentando reconectar...');

                // Tentando conectar novamente e caso tenha sucesso
                // envia a mensagem novamente
                self.connect(function() {
                    self.sendMessage();
                });

                // Saindo do método
                return;
            }

            // Envia os dados para o servidor através do websocket
            self.ws.send(JSON.stringify({
                user: self.user,
                text: self.text,
            }));

            // Limpando texto da mensagem
            self.text = null;

        },

        // Método responsável por "rolar" a scroll do chat para baixo
        scrollDown: function() {
            var container = this.$el.querySelector('#messages');
            container.scrollTop = this.$el.querySelector('#messages').scrollHeight * 5;
        },

    }

});