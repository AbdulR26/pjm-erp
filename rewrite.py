import re

with open('app/Http/Controllers/Admin/Api/OrderController.php', 'r') as f:
    content = f.read()

def replace_body(func_name, new_body, content):
    pattern = r'(public function ' + func_name + r'\s*\([^)]*\)\s*\{)(.*?)(?=\n\s*/\*\*|\n\s*public function|\n\})'
    # We use DOTALL to match across lines
    return re.sub(pattern, r'\1\n' + new_body + '\n    }', content, flags=re.DOTALL)

body_invoices = """
        $orderIds = $request->input('order_ids');
        if (is_string($orderIds)) {
            $orderIds = explode(',', $orderIds);
        }

        if (empty($orderIds)) {
            return response("Tidak ada order yang dipilih.", 400);
        }

        $orders = Order::with(['customer', 'items', 'payment', 'shipment'])->whereIn('id', $orderIds)->orderBy('created_at', 'desc')->get();

        if ($orders->isEmpty()) {
            return response("Order tidak ditemukan.", 404);
        }

        return view('admin.orders.print-invoice', compact('orders'));"""

body_resis = """
        $orderIds = $request->input('order_ids');
        if (is_string($orderIds)) {
            $orderIds = explode(',', $orderIds);
        }

        if (empty($orderIds)) {
            return response("Tidak ada order yang dipilih.", 400);
        }

        $orders = Order::with(['customer', 'items', 'shipment'])->whereIn('id', $orderIds)->orderBy('created_at', 'desc')->get();

        if ($orders->isEmpty()) {
            return response("Order tidak ditemukan.", 404);
        }

        return view('admin.orders.print-resi', compact('orders'));"""

body_invoice = """
        $order = Order::with(['customer', 'items', 'payment', 'shipment'])->findOrFail($id);
        $orders = collect([$order]);

        return view('admin.orders.print-invoice', compact('orders'));"""

body_resi = """
        $order = Order::with(['customer', 'items', 'shipment'])->findOrFail($id);
        $orders = collect([$order]);

        return view('admin.orders.print-resi', compact('orders'));"""

content = replace_body('printInvoices', body_invoices, content)
content = replace_body('printResis', body_resis, content)
content = replace_body('printInvoice', body_invoice, content)
content = replace_body('printResi', body_resi, content)

with open('app/Http/Controllers/Admin/Api/OrderController.php', 'w') as f:
    f.write(content)
