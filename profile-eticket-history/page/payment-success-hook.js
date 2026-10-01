
/*
 * OPTIONAL INTEGRATION HOOK
 * Load this AFTER payment.js on Pemesanan/payment.html.
 * It captures the successful payment click BEFORE the existing script clears localStorage.
 *
 * It does not replace or edit teman's payment.js.
 */
(function () {
  const btn = document.getElementById('btn-pay');
  if (!btn) return;

  btn.addEventListener('click', function () {
    const email = localStorage.getItem('tix_current_user');
    if (!email) return; // user must login first

    const seats = JSON.parse(localStorage.getItem('selectedSeats') || '[]');
    const subtotal = Number(localStorage.getItem('totalPrice') || 0);
    const total = Number(localStorage.getItem('grandTotal') || (subtotal + seats.length * 4000));

    if (!seats.length) return;

    const orders = JSON.parse(localStorage.getItem('tix_orders') || '[]');
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');

    const order = {
      id: `TIX-${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      email,
      movie: localStorage.getItem('selectedMovie') || 'Film Pilihan',
      cinema: localStorage.getItem('selectedCinema') || 'Bioskop Pilihan',
      date: localStorage.getItem('selectedDate') || now.toLocaleDateString('id-ID', {
        day: '2-digit', month: 'long', year: 'numeric'
      }),
      time: localStorage.getItem('selectedTime') || '-',
      seats,
      total,
      paymentMethod: document.querySelector('input[name="payment"]:checked')?.value || 'qris',
      status: 'PAID',
      createdAt: now.toISOString(),
      paidAt: now.toISOString()
    };

    orders.push(order);
    localStorage.setItem('tix_orders', JSON.stringify(orders));
  }, true); // capture = true, runs before payment.js
})();
