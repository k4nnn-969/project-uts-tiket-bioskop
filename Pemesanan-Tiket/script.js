const serviceFee=3000,maxTickets=6,selectedSeats=new Set();
const filmOptions={
  'last-frontier':{title:'The Last Frontier',genre:'ACTION · PETUALANGAN',age:'13+',rating:'8.5',image:'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=300&q=85',price:50000,date:'Jumat, 2 Oktober 2026',shortDate:'Jumat, 2 Okt',cinema:'Senayan City XXI'},
  'after-the-rain':{title:'After the Rain',genre:'DRAMA · ROMANCE',age:'13+',rating:'9.0',image:'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=300&q=85',price:45000,date:'Jumat, 2 Oktober 2026',shortDate:'Jumat, 2 Okt',cinema:'Senayan City XXI'}
};
const query=new URLSearchParams(window.location.search),film=filmOptions[query.get('film')]||filmOptions['last-frontier'];
const selectedTime=query.get('jam')||'17:00',selectedCinema=query.get('bioskop')||film.cinema;
const seatMap=document.getElementById('seat-map'),continueButton=document.getElementById('continue-button'),toast=document.getElementById('toast');
let currentStage='seats',currentPaymentMethod='QRIS',discount=0,toastTimer;

function formatPrice(value){return new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(value)}
function showToast(message){toast.textContent=message;toast.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('visible'),2600)}
function selectPaymentMethod(method){
  currentPaymentMethod=method;
  const radio=[...document.querySelectorAll('input[name="payment-method"]')].find(input=>input.value===method);
  if(radio)radio.checked=true;
  document.querySelectorAll('[data-quick-method]').forEach(button=>{
    const selected=button.dataset.quickMethod===method;
    button.classList.toggle('is-selected',selected);button.setAttribute('aria-pressed',String(selected));
  });
  document.getElementById('summary-payment-name').textContent=`${method} dipilih`;
}
function makeSeatMap(){
  Array.from({length:14},(_,index)=>String.fromCharCode(65+index)).forEach(row=>{
    for(let number=1;number<=16;number++){
      const seatId=`${row}${number}`,seat=document.createElement('button');seat.type='button';seat.className='seat';seat.textContent=seatId;seat.dataset.seat=seatId;seat.setAttribute('aria-label',`Kursi ${seatId}, tersedia`);seat.setAttribute('aria-pressed','false');
      seat.addEventListener('click',()=>toggleSeat(seatId,seat));
      seatMap.append(seat);
    }
  });
}
function toggleSeat(seatId,seat){
  if(selectedSeats.has(seatId)){selectedSeats.delete(seatId);seat.classList.remove('is-selected');seat.setAttribute('aria-pressed','false')}
  else if(selectedSeats.size>=maxTickets){showToast(`Maksimal ${maxTickets} kursi per pesanan.`);return}
  else{selectedSeats.add(seatId);seat.classList.add('is-selected');seat.setAttribute('aria-pressed','true')}
  updateOrder();
}
function updateOrder(){
  const count=selectedSeats.size,subtotal=count*film.price,fee=count*serviceFee,total=Math.max(0,subtotal+fee-discount),seats=[...selectedSeats].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
  document.getElementById('ticket-count').textContent=`${count} tiket`;
  document.getElementById('ticket-quantity').textContent=count;
  document.getElementById('ticket-unit-price').textContent=formatPrice(film.price);
  document.getElementById('ticket-subtotal').textContent=formatPrice(subtotal);
  document.getElementById('service-fee').textContent=formatPrice(fee);
  document.getElementById('order-total').textContent=formatPrice(total);
  document.getElementById('mobile-total').textContent=formatPrice(total);
  document.getElementById('mobile-seat-summary').textContent=`Kursi: ${seats.length?seats.join(', '):'-'}`;
  document.getElementById('order-seats').textContent=seats.length?seats.join(', '):'Pilih kursi';
  document.getElementById('seat-note').textContent=count?`${count} kursi dipilih: ${seats.join(', ')}`:'Pilih hingga 6 kursi untuk melanjutkan.';
  document.getElementById('seat-note').classList.toggle('has-selection',count>0);
  document.getElementById('discount-row').hidden=!discount;
  document.getElementById('discount-amount').textContent=`−${formatPrice(discount)}`;
  continueButton.disabled=!count;
  document.getElementById('continue-label').textContent=count?'Lanjutkan pesanan':'Pilih kursi dulu';
  document.getElementById('preview-seats').textContent=seats.length?seats.join(', '):'-';
}
function setStage(stage){
  currentStage=stage;
  document.body.classList.toggle('is-seat-stage',stage==='seats');
  continueButton.hidden=stage!=='seats';
  document.querySelectorAll('.booking-stage').forEach(panel=>{panel.hidden=panel.id!==`stage-${stage}`;panel.classList.toggle('is-active',!panel.hidden)});
  document.querySelectorAll('[data-progress]').forEach((item,index)=>{const stages=['seats','summary','payment'],activeIndex=stages.indexOf(stage);item.classList.toggle('is-current',stages[index]===stage);item.classList.toggle('is-complete',index<activeIndex)});
  if(stage==='summary'){
    document.getElementById('preview-movie').textContent=film.title;document.getElementById('preview-cinema').textContent=selectedCinema;
    document.getElementById('preview-date').textContent=film.date;document.getElementById('preview-time').textContent=selectedTime;
  }
  window.scrollTo({top:0,behavior:'smooth'});
}
function applyPromo(){
  const input=document.getElementById('promo-code'),message=document.getElementById('promo-message'),code=input.value.trim().toUpperCase();
  if(code==='TIXHEMAT'&&selectedSeats.size){discount=Math.min(10000,selectedSeats.size*film.price);message.textContent=`Kode aktif. Hemat ${formatPrice(discount)}.`;message.className='is-applied';input.disabled=true;document.getElementById('apply-promo').textContent='Terpasang';document.getElementById('apply-promo').disabled=true;updateOrder()}
  else{message.textContent=code==='TIXHEMAT'?'Pilih kursi terlebih dahulu untuk memakai promo.':'Kode promo tidak ditemukan.';message.className='is-invalid'}
}
function completePayment(){
  const email=document.getElementById('contact-email'),terms=document.getElementById('terms-check');
  if(!email.value||!email.checkValidity()){email.reportValidity();return}
  if(!terms.checked){showToast('Setujui syarat pemesanan untuk melanjutkan.');terms.focus();return}
  document.getElementById('booking-code').textContent=`TIX-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
  document.getElementById('success-detail').textContent=`${film.title} · ${selectedTime} · ${currentPaymentMethod}`;
  document.getElementById('success-seat-list').textContent=`Kursi ${[...selectedSeats].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true})).join(', ')}`;
  setStage('success');
}
function resetBooking(){selectedSeats.clear();discount=0;selectPaymentMethod('QRIS');document.querySelectorAll('.seat.is-selected').forEach(seat=>{seat.classList.remove('is-selected');seat.setAttribute('aria-pressed','false')});document.getElementById('promo-code').disabled=false;document.getElementById('promo-code').value='';document.getElementById('promo-message').textContent='Coba kode TIXHEMAT untuk diskon Rp10.000.';document.getElementById('promo-message').className='';document.getElementById('apply-promo').disabled=false;document.getElementById('apply-promo').textContent='Pakai kode';document.getElementById('contact-email').value='';document.getElementById('terms-check').checked=false;updateOrder();setStage('seats')}

document.getElementById('movie-title').textContent=film.title;
document.getElementById('movie-genre').textContent=film.genre;
document.getElementById('movie-rating-age').textContent=film.age;
document.querySelector('.movie-poster').src=film.image;
document.querySelector('.movie-poster').alt=`Poster ${film.title}`;
document.querySelector('.rating').innerHTML=`<span aria-hidden="true">★</span> ${film.rating}`;
document.getElementById('cinema-name').textContent=`${selectedCinema}, Jakarta`;
document.getElementById('show-date').textContent=film.date;
document.getElementById('show-time').textContent=selectedTime;
document.getElementById('order-movie-title').textContent=film.title;
document.getElementById('order-cinema').textContent=selectedCinema;
document.getElementById('order-date').textContent=film.shortDate;
document.getElementById('order-time').textContent=selectedTime;
document.querySelector('.seat-price').innerHTML=`${formatPrice(film.price)} <small>/ kursi</small>`;
document.body.classList.add('is-seat-stage');makeSeatMap();updateOrder();
continueButton.addEventListener('click',()=>{if(selectedSeats.size)setStage('summary')});
document.querySelector('[data-next="payment"]').addEventListener('click',()=>setStage('payment'));
document.querySelectorAll('[data-back]').forEach(button=>button.addEventListener('click',()=>setStage(button.dataset.back)));
document.querySelectorAll('input[name="payment-method"]').forEach(radio=>radio.addEventListener('change',()=>selectPaymentMethod(radio.value)));
document.querySelectorAll('[data-quick-method]').forEach(button=>button.addEventListener('click',()=>selectPaymentMethod(button.dataset.quickMethod)));
selectPaymentMethod(currentPaymentMethod);
document.getElementById('apply-promo').addEventListener('click',applyPromo);
document.getElementById('promo-code').addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();applyPromo()}});
document.getElementById('pay-button').addEventListener('click',completePayment);
document.getElementById('new-order').addEventListener('click',resetBooking);