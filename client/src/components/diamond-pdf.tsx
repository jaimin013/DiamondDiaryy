import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
} from "@react-pdf/renderer";
import { Diamond, Member } from "@shared/schema";
import { format } from "date-fns";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    padding: 30,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    margin: 10,
    padding: 10,
  },
  table: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    marginVertical: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    borderBottomStyle: "solid",
    alignItems: "center",
    minHeight: 30,
  },
  tableHeader: {
    backgroundColor: "#f0f0f0",
  },
  tableCell: {
    flex: 1,
    padding: 5,
    fontSize: 10,
  },
  memberCell: {
    flex: 1.2,
  },
  dateCell: {
    flex: 1.2,
  },
  weightCell: {
    flex: 0.9,
  },
  priceCell: {
    flex: 1,
  },
  quantityCell: {
    flex: 0.8,
  },
  totalCell: {
    flex: 1,
  },
  summary: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f0f0f0",
  },
});

interface DiamondPDFProps {
  diamonds: Diamond[];
  member?: Member;
  members?: Member[];
  onClose: () => void;
}

export function DiamondPDF({
  diamonds,
  member,
  members,
  onClose,
}: DiamondPDFProps) {
  const totalQuantity = diamonds.reduce(
    (acc, d) => acc + Number(d.quantity),
    0,
  );
  const totalAmount = diamonds.reduce((acc, d) => acc + Number(d.total), 0);

  // Create a map of member IDs to names for when viewing all members
  const memberMap =
    members?.reduce(
      (acc, m) => ({
        ...acc,
        [m.id]: m.name,
      }),
      {} as Record<number, string>,
    ) || {};

  // Generate filename based on member
  const filename = member
    ? `${member.name.replace(/\s+/g, "_")}_diamonds_${format(new Date(), "dd-MM-yyyy")}.pdf`
    : `diamonds_${format(new Date(), "dd-MM-yyyy")}.pdf`;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="container flex items-center justify-center h-full">
        <PDFViewer className="w-full h-[90vh]" filename={filename}>
          <Document title={filename}>
            <Page size="A4" style={styles.page}>
              <Text style={styles.header}>
                Diamond Report {member ? `- ${member.name}` : "(All Members)"}
              </Text>

              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={[styles.tableCell, styles.dateCell]}>Date</Text>
                  {!member && (
                    <Text style={[styles.tableCell, styles.memberCell]}>
                      Member
                    </Text>
                  )}
                  <Text style={[styles.tableCell, styles.weightCell]}>
                    Weight (From)
                  </Text>
                  <Text style={[styles.tableCell, styles.weightCell]}>
                    Weight (To)
                  </Text>
                  <Text style={[styles.tableCell, styles.priceCell]}>
                    Price (Rs.)
                  </Text>
                  <Text style={[styles.tableCell, styles.quantityCell]}>
                    Quantity
                  </Text>
                  <Text style={[styles.tableCell, styles.totalCell]}>
                    Total (Rs.)
                  </Text>
                </View>

                {diamonds.map((diamond, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.dateCell]}>
                      {format(new Date(diamond.date), "dd/MM/yyyy")}
                    </Text>
                    {!member && (
                      <Text style={[styles.tableCell, styles.memberCell]}>
                        {memberMap[diamond.memberId] || "Unknown"}
                      </Text>
                    )}
                    <Text style={[styles.tableCell, styles.weightCell]}>
                      {diamond.weightFrom}
                    </Text>
                    <Text style={[styles.tableCell, styles.weightCell]}>
                      {diamond.weightTo}
                    </Text>
                    <Text style={[styles.tableCell, styles.priceCell]}>
                      {diamond.price}
                    </Text>
                    <Text style={[styles.tableCell, styles.quantityCell]}>
                      {diamond.quantity}
                    </Text>
                    <Text style={[styles.tableCell, styles.totalCell]}>
                      {diamond.total}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.summary}>
                <Text>Total Quantity: {totalQuantity}</Text>
                <Text>Total Amount: Rs. {totalAmount.toFixed(2)}</Text>
              </View>
            </Page>
          </Document>
        </PDFViewer>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-primary text-white rounded-md"
        >
          Close
        </button>
      </div>
    </div>
  );
}
