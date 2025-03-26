import React, { useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { format } from "date-fns";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const BuscarTrabajadorEPP = () => {
    const [cedula, setCedula] = useState("");
    const [trabajador, setTrabajador] = useState(null);
    const [entregas, setEntregas] = useState([]);
    const [generandoPDF, setGenerandoPDF] = useState(false);

    const handleBuscarTrabajador = async () => {
        try {
            const responseTrabajador = await fetch(
                `http://localhost:4000/api/epp/buscar-trabajador/${cedula}`
            );
            const dataTrabajador = await responseTrabajador.json();

            if (dataTrabajador.success) {
                setTrabajador(dataTrabajador.trabajador);

                const responseEntregas = await fetch(
                    `http://localhost:4000/api/epp/entregas-por-trabajador/${dataTrabajador.trabajador._id}`
                );
                const dataEntregas = await responseEntregas.json();

                if (dataEntregas.success) {
                    setEntregas(dataEntregas.entregas);
                } else {
                    Swal.fire("Error", "No se encontraron entregas para este trabajador", "error");
                }
            } else {
                Swal.fire("Error", "Trabajador no encontrado", "error");
            }
        } catch (error) {
            console.error("Error al buscar el trabajador:", error);
            Swal.fire("Error", "Hubo un problema al buscar el trabajador", "error");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleBuscarTrabajador();
        }
    };

    const handleDescargarPDF = async () => {
        if (!trabajador || entregas.length === 0) {
            Swal.fire("Error", "No hay datos para descargar", "error");
            return;
        }

        setGenerandoPDF(true);
        
        try {
            const pdf = new jsPDF("p", "mm", "a4");
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 15;
            let yPosition = margin;
            let currentPage = 1;

            pdf.setFont("helvetica", "normal");
            
            const addHeader = () => {
                pdf.setFontSize(16);
                pdf.setTextColor(40);
                pdf.text("COMPROBANTES DE ENTREGAS EPP UNIPALMA", pageWidth / 2, yPosition, { align: 'center' });
                yPosition += 8;
                
                pdf.setFontSize(12);
                pdf.text(`Trabajador: ${trabajador.nombre} ${trabajador.apellido}`, pageWidth / 2, yPosition, { align: 'center' });
                yPosition += 6;
                pdf.text(`Cédula: ${trabajador.cedula}`, pageWidth / 2, yPosition, { align: 'center' });
                yPosition += 10;

                pdf.text(`Centro de operación: ${trabajador.centro_de_operacion}`, margin, yPosition);
                yPosition += 6;
                pdf.text(`Cargo: ${trabajador.cargo}`, margin, yPosition);
                yPosition += 6;
                pdf.text(`Empresa: ${trabajador.empresa}`, margin, yPosition);
                yPosition += 10;
            };

            addHeader();

            for (let i = 0; i < entregas.length; i++) {
                const entrega = entregas[i];
                const fecha = new Date(entrega.fecha_entrega);
                const fechaFormateada = isNaN(fecha) ? "Fecha inválida" : format(fecha, "dd/MM/yyyy");

                if (yPosition > pageHeight - 60) {
                    pdf.addPage();
                    currentPage++;
                    yPosition = margin;
                    addHeader();
                }

                pdf.setFontSize(12);
                pdf.setTextColor(0);
                pdf.setFont("helvetica", "bold");
                pdf.text(`Entrega #${i + 1} - ${fechaFormateada}`, margin, yPosition);
                yPosition += 8;

                pdf.setFont("helvetica", "normal");
                pdf.text(`• EPP Entregado: ${entrega.epp_entregado}`, margin, yPosition);
                yPosition += 6;
                pdf.text(`• Referencia/Tipo: ${entrega.referencia_tipo}`, margin, yPosition);
                yPosition += 6;
                pdf.text(`• Responsable: ${entrega.nombre_hs_entrega}`, margin, yPosition);
                yPosition += 6;
                pdf.text(`• Tarea/Labor: ${entrega.tarea_labor}`, margin, yPosition);
                yPosition += 10;

                if (entrega.firma) {
                    try {
                        const firmaContainer = document.createElement("div");
                        firmaContainer.innerHTML = `<img src="${entrega.firma}" style="width: 80px; height: 40px; background: white;"/>`;
                        firmaContainer.style.position = "absolute";
                        firmaContainer.style.left = "-9999px";
                        document.body.appendChild(firmaContainer);

                        const canvas = await html2canvas(firmaContainer.querySelector("img"), {
                            scale: 2,
                            useCORS: true,
                            width: 80,
                            height: 40,
                            backgroundColor: null
                        });

                        document.body.removeChild(firmaContainer);

                        const imgData = canvas.toDataURL("image/png");
                        const imgWidth = 40;
                        const imgHeight = 20;

                        pdf.addImage(imgData, "PNG", pageWidth - margin - imgWidth, yPosition, imgWidth, imgHeight);
                        pdf.text("Firma:", pageWidth - margin - imgWidth - 15, yPosition + 10);
                        yPosition += imgHeight + 15;
                    } catch (error) {
                        console.error("Error al procesar firma:", error);
                        pdf.text("Firma no disponible", pageWidth - margin - 40, yPosition + 10);
                        yPosition += 20;
                    }
                } else {
                    pdf.text("Sin firma", pageWidth - margin - 30, yPosition + 10);
                    yPosition += 20;
                }

                pdf.setDrawColor(200);
                pdf.setLineWidth(0.2);
                pdf.line(margin, yPosition, pageWidth - margin, yPosition);
                yPosition += 10;
            }

            pdf.save(`EPP_${trabajador.cedula}_${format(new Date(), 'yyyyMMdd')}.pdf`);

        } catch (error) {
            console.error("Error al generar PDF:", error);
            Swal.fire("Error", "No se pudo generar el PDF", "error");
        } finally {
            setGenerandoPDF(false);
        }
    };

    return (
        <div className="body-epp">
            <nav className="nav-registro">
                <div className="hamburger-registro" id="hamburger-registro">
                    <div className="line line1"></div>
                    <div className="line line2"></div>
                </div>
                <ul id="menu" className="menu">
                    <li>
                        <Link to="/home" className="nav-link-registro">
                            Inicio
                        </Link>
                    </li>
                    <li>
                        <Link to="/" className="nav-link-registro">
                            Cerrar Sesión
                        </Link>
                    </li>
                </ul>
            </nav>

            <div className="epp-container">
                <h1 className="epp-title">Buscar Trabajador y Entregas de EPP</h1>

                <div className="epp-search">
                    <input
                        type="text"
                        className="epp-input"
                        placeholder="Ingrese la cédula"
                        value={cedula}
                        onChange={(e) => setCedula(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    <button className="epp-button" onClick={handleBuscarTrabajador}>
                        Buscar
                    </button>
                </div>

                {trabajador && (
                    <div className="epp-info-trabajador">
                        <h2>Información del Trabajador</h2>
                        <p><strong>Nombre:</strong> {trabajador.nombre} {trabajador.apellido}</p>
                        <p><strong>Cédula:</strong> {trabajador.cedula}</p>
                        <p><strong>Centro de Operación:</strong> {trabajador.centro_de_operacion}</p>
                        <p><strong>Cargo:</strong> {trabajador.cargo}</p>
                        <p><strong>Empresa:</strong> {trabajador.empresa}</p>
                    </div>
                )}

                {entregas.length > 0 && (
                    <div className="epp-entregas-section">
                        <h2>Entregas Registradas ({entregas.length})</h2>
                        <button 
                            className="epp-button" 
                            onClick={handleDescargarPDF}
                            disabled={generandoPDF}
                        >
                            {generandoPDF ? 'Generando PDF...' : 'Descargar Todas las Entregas (PDF)'}
                        </button>

                        <div className="epp-entregas-list">
                            {entregas.map((entrega, index) => {
                                const fecha = new Date(entrega.fecha_entrega);
                                const fechaFormateada = isNaN(fecha) ? "Fecha inválida" : format(fecha, "dd/MM/yyyy");
                                
                                return (
                                    <div key={entrega._id} className="epp-entrega-card">
                                        <div className="epp-entrega-content">
                                            <h3>Entrega #{index + 1} - {fechaFormateada}</h3>
                                            <p><strong>EPP:</strong> {entrega.epp_entregado}</p>
                                            <p><strong>Tipo:</strong> {entrega.referencia_tipo}</p>
                                            <p><strong>Responsable:</strong> {entrega.nombre_hs_entrega}</p>
                                            <p><strong>Labor:</strong> {entrega.tarea_labor}</p>
                                        </div>
                                        <div className="epp-entrega-firma">
                                            <p><strong>Firma:</strong></p>
                                            <img 
                                                src={entrega.firma} 
                                                alt="Firma del trabajador" 
                                                className="epp-firma-img"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BuscarTrabajadorEPP;