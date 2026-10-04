const serviceFee=3000,maxTickets=6,selectedSeats=new Set();
const filmOptions={
  'last-frontier':{title:'The Last Frontier',genre:'ACTION · PETUALANGAN',age:'13+',rating:'8.5',image:'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=300&q=85',price:50000,date:'Jumat, 2 Oktober 2026',shortDate:'Jumat, 2 Okt',cinema:'Senayan City XXI'},
  'after-the-rain':{title:'After the Rain',genre:'DRAMA · ROMANCE',age:'13+',rating:'9.0',image:'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=300&q=85',price:45000,date:'Jumat, 2 Oktober 2026',shortDate:'Jumat, 2 Okt',cinema:'Senayan City XXI'},
  'resident-evil':{title:'Resident Evil',genre:'HORROR · PETUALANGAN',age:'R17+',rating:'8.7',image:'../img/Resident_Evil.webp',price:50000,date:'',shortDate:'',cinema:'Senayan City XXI'},
  'forgotten-island':{title:'Forgotten Island',genre:'KOMEDI · KELUARGA',age:'SU',rating:'8.4',image:'../img/Forgotten_Island.webp',price:45000,date:'',shortDate:'',cinema:'Senayan City XXI'},
  'fall-2-deadpoint':{title:'Fall 2: Deadpoint',genre:'THRILLER · PETUALANGAN',age:'R13+',rating:'8.2',image:'../img/Fall_2.webp',price:50000,date:'',shortDate:'',cinema:'Senayan City XXI'},
  'digger':{title:'Digger',genre:'KOMEDI · DRAMA',age:'R13+',rating:'8.0',image:'../img/Digger.webp',price:45000,date:'',shortDate:'',cinema:'Senayan City XXI'},
  'memburu-pemangsa':{title:'Memburu Pemangsa',genre:'ACTION · CRIME',age:'R17+',rating:'9.4',image:'https://picsum.photos/seed/memburu/300/450',price:45000,date:'',shortDate:'',cinema:'Senayan City XXI'},
  'avengers-endgame-encore':{title:'Avengers Endgame: Encore',genre:'ACTION · SCI-FI',age:'R13+',rating:'9.7',image:'https://upload.wikimedia.org/wikipedia/en/0/0d/Avengers_Endgame_poster.jpg',price:75000,date:'',shortDate:'',cinema:'Senayan City XXI'}
};
const query=new URLSearchParams(window.location.search),filmKey=query.get('film')||'last-frontier',film=filmOptions[filmKey]||filmOptions['last-frontier'];
const requestedPrice=Number(query.get('harga'));
if(Number.isFinite(requestedPrice)&&requestedPrice>0)film.price=requestedPrice;
const selectedTime=query.get('jam')||'17:00',selectedCinema=query.get('bioskop')||film.cinema,selectedCity=query.get('kota')||'Jakarta';
const requestedDate=query.get('tanggal'),parsedDate=requestedDate?new Date(`${requestedDate}T12:00:00`):new Date(),showDate=Number.isNaN(parsedDate.getTime())?new Date():parsedDate;
const showDateISO=[showDate.getFullYear(),String(showDate.getMonth()+1).padStart(2,'0'),String(showDate.getDate()).padStart(2,'0')].join('-');
const screeningStorageKey=`tix_screening_seats:${[filmKey,selectedCinema,showDateISO,selectedTime].map(encodeURIComponent).join(':')}`;
const showDateLabel=new Intl.DateTimeFormat('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(showDate);
const showDateShort=new Intl.DateTimeFormat('id-ID',{weekday:'short',day:'numeric',month:'short'}).format(showDate);
Object.values(filmOptions).forEach(option=>{option.date=showDateLabel;option.shortDate=showDateShort});
const seatMap=document.getElementById('seat-map'),continueButton=document.getElementById('continue-button'),toast=document.getElementById('toast');
let currentStage='seats',currentPaymentMethod='QRIS',discount=0,toastTimer,occupiedSeats=new Set();

function formatPrice(value){return new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(value)}
function showToast(message){toast.textContent=message;toast.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('visible'),2600)}
function getOccupiedSeats(){
  try{
    const stored=JSON.parse(localStorage.getItem(screeningStorageKey)||'null');
    if(Array.isArray(stored))return new Set(stored);
  }catch{}
  let seed=2166136261;
  for(const character of screeningStorageKey)seed=Math.imul(seed^character.charCodeAt(0),16777619)>>>0;
  const initialSeats=new Set(),seatCount=12+(seed%12);
  while(initialSeats.size<seatCount){
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    initialSeats.add(`${String.fromCharCode(65+(seed%14))}${((seed>>>8)%12)+1}`);
  }
  localStorage.setItem(screeningStorageKey,JSON.stringify([...initialSeats]));
  return initialSeats;
}
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
    for(let number=1;number<=12;number++){
      if(number===7){const aisle=document.createElement('span');aisle.className='seat-aisle';aisle.setAttribute('aria-hidden','true');seatMap.append(aisle)}
      const seatId=`${row}${number}`,seat=document.createElement('button'),isOccupied=occupiedSeats.has(seatId);seat.type='button';seat.className=`seat${isOccupied?' is-occupied':''}`;seat.textContent=seatId;seat.dataset.seat=seatId;seat.disabled=isOccupied;seat.setAttribute('aria-label',`Kursi ${seatId}, ${isOccupied?'terjual':'tersedia'}`);seat.setAttribute('aria-pressed','false');
      if(!isOccupied)seat.addEventListener('click',()=>toggleSeat(seatId,seat));
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
  const mobileSeatSummary=document.getElementById('mobile-seat-summary');
  mobileSeatSummary.replaceChildren(...seats.map(seatId=>{const chip=document.createElement('span');chip.className='selected-seat-chip';chip.textContent=seatId;return chip}));
  if(!seats.length){const placeholder=document.createElement('span');placeholder.className='selected-seat-chip is-placeholder';placeholder.textContent='-';mobileSeatSummary.append(placeholder)}
  document.getElementById('order-seats').textContent=seats.length?seats.join(', '):'Pilih kursi';
  document.getElementById('seat-note').textContent=count?`${count} kursi dipilih: ${seats.join(', ')}`:'Pilih hingga 6 kursi untuk melanjutkan.';
  document.getElementById('seat-note').classList.toggle('has-selection',count>0);
  document.getElementById('discount-row').hidden=!discount;
  document.getElementById('discount-amount').textContent=`−${formatPrice(discount)}`;
  continueButton.disabled=!count;
  document.getElementById('continue-label').textContent=count?'Lanjutkan pesanan':'Pilih kursi dulu';
  document.querySelector('.mobile-continue-label').textContent=`RINGKASAN ORDER (${count})`;
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
  localStorage.setItem(screeningStorageKey,JSON.stringify([...new Set([...occupiedSeats,...selectedSeats])]));
  const bookingCode=`TIX-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
  const seats=[...selectedSeats].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
  const subtotal=seats.length*film.price,fee=seats.length*serviceFee,total=Math.max(0,subtotal+fee-discount);
  let orders=[];
  try{const stored=JSON.parse(localStorage.getItem('tix_orders')||'[]');if(Array.isArray(stored))orders=stored}catch{}
  orders.push({
    id:bookingCode,email:email.value.trim().toLowerCase(),movie:film.title,cinema:selectedCinema,
    date:showDateLabel,dateISO:showDateISO,time:selectedTime,seats,total,subtotal,fee,discount,
    paymentMethod:currentPaymentMethod,status:'PAID',createdAt:new Date().toISOString(),paidAt:new Date().toISOString()
  });
  localStorage.setItem('tix_orders',JSON.stringify(orders));
  document.getElementById('booking-code').textContent=bookingCode;
  document.getElementById('success-detail').textContent=`${film.title} · ${selectedTime} · ${currentPaymentMethod}`;
  document.getElementById('success-seat-list').textContent=`Kursi ${seats.join(', ')}`;
  setStage('success');
}
function resetBooking(){selectedSeats.clear();discount=0;selectPaymentMethod('QRIS');document.querySelectorAll('.seat.is-selected').forEach(seat=>{seat.classList.remove('is-selected');seat.setAttribute('aria-pressed','false')});document.getElementById('promo-code').disabled=false;document.getElementById('promo-code').value='';document.getElementById('promo-message').textContent='Coba kode TIXHEMAT untuk diskon Rp10.000.';document.getElementById('promo-message').className='';document.getElementById('apply-promo').disabled=false;document.getElementById('apply-promo').textContent='Pakai kode';document.getElementById('contact-email').value='';document.getElementById('terms-check').checked=false;updateOrder();setStage('seats')}

document.getElementById('movie-title').textContent=film.title;
document.getElementById('movie-genre').textContent=film.genre;
document.getElementById('movie-rating-age').textContent=film.age;
document.querySelector('.movie-poster').src=film.image;
document.querySelector('.movie-poster').alt=`Poster ${film.title}`;
document.querySelector('.rating').innerHTML=`<span aria-hidden="true">★</span> ${film.rating}`;
document.getElementById('cinema-name').textContent=`${selectedCinema}, ${selectedCity}`;
document.getElementById('show-date').textContent=showDateLabel;
document.getElementById('show-time').textContent=selectedTime;
document.getElementById('order-movie-title').textContent=film.title;
document.getElementById('order-cinema').textContent=selectedCinema;
document.getElementById('order-date').textContent=showDateShort;
document.getElementById('order-time').textContent=selectedTime;
document.getElementById('contact-email').value=localStorage.getItem('tix_current_user')||'';
document.querySelector('.seat-price').innerHTML=`${formatPrice(film.price)} <small>/ kursi</small>`;
occupiedSeats=getOccupiedSeats();
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