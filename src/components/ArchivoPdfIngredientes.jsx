import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
    // Estilos de página: padding interno y tamaño de fuente base
    page: {
        padding: 20,
        fontSize: 10,
    },
    // Estilos del título: centrado, fuerte, con separación inferior
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    // Estilos de tabla: ancho completo, flexbox para filas
    table: {
        display: "table",
        width: "100%",
        // borderStyle: "solid",
        // borderWidth: 1,
        // borderColor: "#bfbfbf",
        marginTop: 20,
    },
    // Estilos de fila: dirección horizontal
    tableRow: {
        margin: "auto",
        flexDirection: "row",
    },
    // Estilos de encabezado: fondo gris, bordes, 25% ancho (4 columnas)
    tableColHeader: {
        width: "25%",
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "#bfbfbf",
        backgroundColor: "#f0f0f0",
        padding: 8,
        fontWeight: "bold",
    },
    // Estilos de columna de datos: bordes, ancho proporcional
    tableCol: {
        width: "25%",
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "#bfbfbf",
        padding: 8,
    },
    // Estilos de celda: tamaño de fuente reducido para tabla
    tableCell: {
        margin: "auto",
        marginTop: 5,
        fontSize: 9,
    },
});

function ArchivoPdfIngredientes({ ingredientes }) {
    return (
        // Documento PDF con página tamaño A4
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Título del documento PDF */}
                <View style={styles.title}>
                    <Text>Listado de Ingredientes</Text>
                </View>

                {/* Tabla principal */}
                <View style={styles.table}>
                    {/* Fila de encabezados */}
                    <View style={styles.tableRow}>
                        {/* Columna: Nombre Campaña */}
                        <View style={styles.tableColHeader}>
                            <Text style={styles.tableCell}>Ingrediente</Text>
                        </View>
                        <View style={styles.tableColHeader}>
                            <Text style={styles.tableCell}>Cantidad</Text>
                        </View>
                        <View style={styles.tableColHeader}>
                            <Text style={styles.tableCell}>Unidad</Text>
                        </View>
                        <View style={styles.tableColHeader}>
                            <Text style={styles.tableCell}>Comprado</Text>
                        </View>
                    </View>

                    {/* Renderizar filas de datos para cada ingrediente */}
                    {ingredientes.map((ingrediente, index) => (
                        <View style={styles.tableRow} key={index}>
                            {/* Celda: Nombre del ingrediente */}
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>{ingrediente.nombre_producto}</Text>
                            </View>
                            {/* Celda: Cantidad */}
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>{ingrediente.cantidad}</Text>
                            </View>
                            {/* Celda: Unidad */}
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>{ingrediente.unidad}</Text>
                            </View>
                            {/* Celda: Comprado */}
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>{ingrediente.comprado ? "Si" : "No"}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </Page>
        </Document>
    );
}
export default ArchivoPdfIngredientes;