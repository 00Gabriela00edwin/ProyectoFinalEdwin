import { useState } from 'react';
import { useCartContext } from '../context/CartContext';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const CheckoutForm = () => {
    const { cart, totalPrice, clear } = useCartContext();
    const [buyer, setBuyer] = useState({ name: "", phone: "", email: "" });
    const [orderId, setOrderId] = useState(null);
    const [loading, setLoading] = useState(false);
    // Nuevo estado para guardar el link de WhatsApp
    const [whatsappUrl, setWhatsappUrl] = useState("");

    const handleChange = (e) => {
        setBuyer({ ...buyer, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Preparamos la orden
            const order = {
                buyer,
                items: cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                })),
                total: totalPrice(),
                date: serverTimestamp(),
            };

            // 2. Guardamos la orden en Firebase
            const orderRef = collection(db, "orders");
            const docRef = await addDoc(orderRef, order);

            // 3. Preparamos el link de WhatsApp ANTES de borrar el carrito
            const productosNombre = cart.map(item => item.name).join(', ');
            const telefonoTuyo = "5493765056586"; // Tu número
            
            const mensaje = `Hola A&G bombillas quiero finalizar el pago de mi pedido.\n\n🆔 ID: ${docRef.id}\n👤 Cliente: ${buyer.name}\n🧉 Productos: ${productosNombre}\n💰 Total: $${totalPrice()}`;
            
            const linkGenerado = `https://wa.me/${telefonoTuyo}?text=${encodeURIComponent(mensaje)}`;
            
            // Guardamos el link y el ID para usarlos en la pantalla de éxito
            setWhatsappUrl(linkGenerado);
            setOrderId(docRef.id);

            // 4. Actualizamos el stock
            const updateStockPromises = cart.map(item => {
                const itemRef = doc(db, "products", item.id);
                return updateDoc(itemRef, { stock: item.stock - item.quantity });
            });
            await Promise.all(updateStockPromises);

            // 5. Limpiamos el carrito
            clear();
            setLoading(false);

        } catch (error) {
            console.error("Error al generar la orden:", error);
            alert("Hubo un error al procesar la compra. Inténtalo de nuevo.");
            setLoading(false);
        }
    };

    // VISTA DE ÉXITO (Ahora con botón manual para ir a WhatsApp)
    if (orderId) {
        return (
            <main style={{ textAlign: "center", marginTop: "50px", padding: "20px" }}>
                <h2 style={{ color: "#D4AF37", fontSize: "2rem" }}>🎉 ¡Compra finalizada con éxito!</h2>
                <h3 style={{ margin: "20px 0" }}>AHORA TIENES UNA BOMBILLA ORIGINAL</h3>
                
                <div style={{ backgroundColor: "#f9f9f9",color:"#020101ff", padding: "20px", borderRadius: "10px", maxWidth: "500px", margin: "20px auto", border: "1px solid #ddd" }}>

                 <p style={{ color: "black" }}>Gracias por tu compra, <strong>{buyer.name}</strong>.</p>
                 <p style={{ color: "black" }}>Tu <strong>ID de Orden</strong> es:</p>

                    <p style={{ color: "black" , fontSize: "1.5rem", fontWeight: "bold", color: "#333", margin: "10px 0" }}>{orderId}</p>
                </div>

                <p style={{ fontSize: "1.1rem", marginBottom: "20px" }}>
                    Para completar tu compra, haz clic en el botón de abajo <br/>
                    y envíanos el pedido por WhatsApp:
                </p>

                {/* BOTÓN GRANDE PARA IR A WHATSAPP */}
                <a href={whatsappUrl} target="_blank" rel="noreferrer" style={{
                    display: "inline-block",
                    backgroundColor: "#25D366", // Color verde WhatsApp
                    color: "white",
                    padding: "15px 30px",
                    borderRadius: "50px",
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: "1.2rem",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    marginBottom: "30px",
                    transition: "transform 0.2s"
                }}>
                    📲 FINALIZAR PAGO EN WHATSAPP
                </a>

                <div>
                    <Link to="/" style={{ 
                        color: "gray", 
                        textDecoration: "underline" 
                    }}>
                        Volver al inicio
                    </Link>
                </div>
            </main>
        );
    }

    if (loading) return <main><p style={{textAlign:"center", marginTop:"50px"}}>Procesando compra...</p></main>;

    if (cart.length === 0) return <main><p style={{textAlign:"center", marginTop:"50px"}}>Tu carrito está vacío. <Link to="/">Volver</Link></p></main>;

    // FORMULARIO DE COMPRA
    return (
        <main>
            <h2 style={{textAlign: "center", margin: "20px 0", color: "#D4AF37"}}>FINALIZAR COMPRA</h2>
            <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                    type="text"
                    name="name"
                    placeholder="Nombre Completo"
                    value={buyer.name}
                    onChange={handleChange}
                    required
                    style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
                />
                <input
                    type="number"
                    name="phone"
                    placeholder="Teléfono"
                    value={buyer.phone}
                    onChange={handleChange}
                    required
                    style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={buyer.email}
                    onChange={handleChange}
                    required
                    style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
                />

                <h3 style={{textAlign: "center", margin: "10px 0"}}>
                    Total a pagar: {totalPrice()}pesos
                </h3>

                <button type="submit" style={{
                    padding: "10px",
                    backgroundColor: "#D4AF37",
                    color: "black",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "16px"
                }}>
                    Confirmar Compra
                </button>
            </form>
        </main>
    );
}

export default CheckoutForm;