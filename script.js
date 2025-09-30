let cart = [];
let modalQt = 1;
let modalKey = 0;

// Atalhos para querySelector
const c = (el) => document.querySelector(el);
const cs = (el) => document.querySelectorAll(el);

// Debug inicial
console.log('=== PIZZARIA DEBUG ===');
console.log('Total de pizzas no JSON:', pizzaJson.length);
console.log('Elemento pizza-area encontrado:', !!c('.pizza-area'));

// Listar pizzas
pizzaJson.map((item, index) => {
  let pizzaItem = c('.models .pizza-item').cloneNode(true);

  pizzaItem.setAttribute('data-key', index);
  pizzaItem.querySelector('.pizza-item--img img').src = item.img;
  pizzaItem.querySelector('.pizza-item--price').innerHTML = `R$ ${item.price[2].toFixed(2)}`;
  pizzaItem.querySelector('.pizza-item--name').innerHTML = item.name;
  pizzaItem.querySelector('.pizza-item--desc').innerHTML = item.description;
  
  pizzaItem.querySelector('a').addEventListener('click', (e) => {
    e.preventDefault();
    let key = e.target.closest('.pizza-item').getAttribute('data-key');
    modalQt = 1;
    modalKey = key;

    c('.pizzaBig img').src = pizzaJson[key].img;
    c('.pizzaInfo h1').innerHTML = pizzaJson[key].name;
    c('.pizzaInfo--desc').innerHTML = pizzaJson[key].description;
    c('.pizzaInfo--actualPrice').innerHTML = `R$ ${pizzaJson[key].price[2].toFixed(2)}`;
    c('.pizzaInfo--size.selected').classList.remove('selected');
    cs('.pizzaInfo--size').forEach((size, sizeIndex) => {
      if(sizeIndex == 2) size.classList.add('selected');
      size.querySelector('span').innerHTML = pizzaJson[key].sizes[sizeIndex];
    });
    c('.pizzaInfo--qt').innerHTML = modalQt;

    c('.pizzaWindowArea').style.opacity = 0;
    c('.pizzaWindowArea').style.display = 'flex';
    setTimeout(() => {
      c('.pizzaWindowArea').style.opacity = 1;
    }, 200);
  });

  c('.pizza-area').append(pizzaItem);
});

// Debug após carregar pizzas
setTimeout(() => {
    const pizzasCarregadas = document.querySelectorAll('.pizza-item');
    console.log('Pizzas renderizadas na página:', pizzasCarregadas.length);
    
    if(pizzasCarregadas.length === 0) {
        console.error('ERRO: Nenhuma pizza foi renderizada!');
        // Criar elemento de erro visível
        const erroDiv = document.createElement('div');
        erroDiv.style.background = '#ff4444';
        erroDiv.style.color = 'white';
        erroDiv.style.padding = '20px';
        erroDiv.style.margin = '20px';
        erroDiv.style.borderRadius = '10px';
        erroDiv.innerHTML = '<h3>🚨 ERRO: As pizzas não carregaram!</h3><p>Verifique o console (F12) para detalhes.</p>';
        document.querySelector('.pizza-area').appendChild(erroDiv);
    }
}, 100);

// Fechar modal
function closeModal() {
  c('.pizzaWindowArea').style.opacity = 0;
  setTimeout(() => {
    c('.pizzaWindowArea').style.display = 'none';
  }, 500);
}
cs('.pizzaInfo--cancelButton, .pizzaInfo--cancelMobileButton').forEach((item) => {
  item.addEventListener('click', closeModal);
});

// Controle quantidade
c('.pizzaInfo--qtmenos').addEventListener('click', () => {
  if(modalQt > 1) modalQt--;
  c('.pizzaInfo--qt').innerHTML = modalQt;
});
c('.pizzaInfo--qtmais').addEventListener('click', () => {
  modalQt++;
  c('.pizzaInfo--qt').innerHTML = modalQt;
});

// Tamanho
cs('.pizzaInfo--size').forEach((size) => {
  size.addEventListener('click', () => {
    c('.pizzaInfo--size.selected').classList.remove('selected');
    size.classList.add('selected');
  });
});

// Adicionar ao carrinho
c('.pizzaInfo--addButton').addEventListener('click', () => {
  let size = parseInt(c('.pizzaInfo--size.selected').getAttribute('data-key'));
  let identifier = pizzaJson[modalKey].id+'@'+size;
  let key = cart.findIndex((item) => item.identifier == identifier);

  if(key > -1) {
    cart[key].qt += modalQt;
  } else {
    cart.push({
      identifier,
      id:pizzaJson[modalKey].id,
      size,
      qt:modalQt
    });
  }
  updateCart();
  closeModal();
});

// Carrinho
c('.menu-openner').addEventListener('click', () => {
  if(cart.length > 0) {
    c('aside').classList.add('show');
  }
});
c('.menu-closer').addEventListener('click', () => {
  c('aside').classList.remove('show');
});

function updateCart() {
  c('.menu-openner span').innerHTML = cart.length;

  if(cart.length > 0) {
    c('aside').classList.add('show');
    c('.cart').innerHTML = '';

    let subtotal = 0;
    let desconto = 0;
    let total = 0;

    for(let i in cart) {
      let pizzaItem = pizzaJson.find((item) => item.id == cart[i].id);
      subtotal += pizzaItem.price[cart[i].size] * cart[i].qt;

      let cartItem = c('.models .cart--item').cloneNode(true);
      let pizzaSizeName;
      switch(cart[i].size) {
        case 0: pizzaSizeName = 'P'; break;
        case 1: pizzaSizeName = 'M'; break;
        case 2: pizzaSizeName = 'G'; break;
      }
      let pizzaName = `${pizzaItem.name} (${pizzaSizeName})`;

      cartItem.querySelector('img').src = pizzaItem.img;
      cartItem.querySelector('.cart--item-nome').innerHTML = pizzaName;
      cartItem.querySelector('.cart--item--qt').innerHTML = cart[i].qt;
      cartItem.querySelector('.cart--item-qtmenos').addEventListener('click', () => {
        if(cart[i].qt > 1) {
          cart[i].qt--;
        } else {
          cart.splice(i, 1);
        }
        updateCart();
      });
      cartItem.querySelector('.cart--item-qtmais').addEventListener('click', () => {
        cart[i].qt++;
        updateCart();
      });

      c('.cart').append(cartItem);
    }

    desconto = subtotal * 0.1;
    total = subtotal - desconto;

    c('.subtotal span:last-child').innerHTML = `R$ ${subtotal.toFixed(2)}`;
    c('.desconto span:last-child').innerHTML = `R$ ${desconto.toFixed(2)}`;
    c('.total span:last-child').innerHTML = `R$ ${total.toFixed(2)}`;

  } else {
    c('aside').classList.remove('show');
  }
}

// Finalizar pedido no WhatsApp
c('.cart--finalizar').addEventListener('click', () => {
  if(cart.length === 0) {
    alert('Seu carrinho está vazio!');
    return;
  }
  
  let msg = "🍕 *PEDIDO DE PIZZAS* 🍕\n\n";
  msg += "*Itens do pedido:*\n";
  
  cart.forEach((item, index) => {
    let pizzaItem = pizzaJson.find((p) => p.id == item.id);
    let sizeName = ['P', 'M', 'G'][item.size];
    let price = pizzaItem.price[item.size] * item.qt;
    msg += `${index + 1}. ${pizzaItem.name} (${sizeName}) - ${item.qt}x - R$ ${price.toFixed(2)}\n`;
  });

  let subtotal = cart.reduce((total, item) => {
    let pizzaItem = pizzaJson.find((p) => p.id == item.id);
    return total + (pizzaItem.price[item.size] * item.qt);
  }, 0);

  msg += `\n*Subtotal:* R$ ${subtotal.toFixed(2)}`;
  msg += `\n*Desconto (10%):* R$ ${(subtotal * 0.1).toFixed(2)}`;
  msg += `\n*Total:* R$ ${(subtotal * 0.9).toFixed(2)}`;
  msg += `\n\nObrigado! 🍕`;

  window.open(`https://wa.me/5599999999999?text=${encodeURIComponent(msg)}`, '_blank');
});

console.log('=== PIZZARIA CONFIGURADA ===');