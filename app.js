const vm = new Vue({
  el: "#app",
  data: {
    produtos: [],
    produto: false,
    carrinho: [],
    mensagemAlerta: "Item adicionado",
    alertaAtivo: false,
    carrinhoAtivo: true
  },
  filters: {
    numeroPreco(value) { // é o valor onde foi adicionado no html, no caso o preço
      return value.toLocaleString("pt-BR", {style: "currency", currency: "BRL"});
    }
  },
  computed: {
    carrinhoTotal() { // sempre será atulizada quando carrinho mudar, recalculando novamente o total
      let total = 0;
      if(this.carrinho.length) {
        this.carrinho.forEach(item => {
          total += item.preco;
        })
      }
      return total;
    }
  },
  methods: {
    fetchProdutos() { // método que irá puxar todos os produtos
      fetch("./api/produtos.json")
      .then(r => r.json())
      .then(r => {
        this.produtos = r;
      })
    },
    fetchProduto(id) { // pegar um produto unico
      fetch(`./api/produtos/${id}/dados.json`)
      .then(r => r.json())
      .then(r => {
        this.produto = r
      })
    },
    abrirModal(id) {
      this.fetchProduto(id);
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      })
    },
    fecharModal({ target, currentTarget }) { // fechar modal ao clicar fora
      if(target === currentTarget) this.produto = false
    },
    clickForaCarrinho({ target, currentTarget }) { 
      if(target === currentTarget) this.carrinhoAtivo = false
    },
    adicionarItem() { // adicionar item ao carrinho
      this.produto.estoque--;
      const {id, nome, preco} = this.produto;
      this.carrinho.push({id, nome, preco});
      this.alerta(`${nome} adicionado ao carrinho`)
    },
    removerItem() {
      this.carrinho.splice(0, 1);
    },
    checarLocalStorage() {
      if(window.localStorage.carrinho) {
        this.carrinho = JSON.parse(window.localStorage.carrinho); // de string para transformar de volta
      }
    },
    compararEstoque() {
      const items = this.carrinho.filter(({id}) => id === this.produto.id);
      this.produto.estoque -= items.length;
    },
    alerta(mensagem) {
      this.mensagemAlerta = mensagem;
      this.alertaAtivo = true;
      setTimeout(() => {
        this.alertaAtivo = false;
      }, 1500)
    },
    router() {
      const hash = document.location.hash;
      if (hash) 
        this.fetchProduto(hash.replace("#", ""));
    }
  },
  watch: {
    carrinho() {
      window.localStorage.carrinho = JSON.stringify(this.carrinho); // transforma o array ou objeto em uma string
    },
    produto() { // toda vez que o produto mudar o router sera ativado
      document.title = this.produto.nome || "Techno";
      const hash = this.produto.id || "";
      history.pushState(null,null, `#${hash}`);
      if(this.produto) {
        this.compararEstoque();
      }
    }
  },
  created() { // no momento da criação do vuejs será ativado 
    this.fetchProdutos();
    this.checarLocalStorage();
    this.router();
  }
})