<?php
namespace Qollam\Customer\Http\Controllers;

use Illuminate\Routing\Controller;
use Scaffolding\Traits\ScaffoldingTrait;
use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    use ScaffoldingTrait;

    public function __construct()
    {
        $this->setConfig([
            'model' => new Customer(),
            'title' => 'Customer',
            'url' => 'admin/customers',
            'prefix' => 'customer',
        ]);

        $this->scaffolding()->datatableColumnUnset(['created_at', 'updated_at', 'action']);
        
        $this->scaffolding()->datatableColumnSet('name', ['title' => 'Name']);
        $this->scaffolding()->datatableColumnSet('email', ['title' => 'Email']);
        $this->scaffolding()->datatableColumnSet('phone', ['title' => 'Phone']);
        $this->scaffolding()->datatableColumnSet('address', ['title' => 'Address']);

        $this->scaffolding()->datatableColumnSet('action', [
            'title' => 'Actions',
            'searchable' => false,
            'orderable' => false,
            'className' => 'text-center'
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(\Scaffolding\Requests\ScaffoldingRequest $request)
    {
        if ($request->isMethod('put')) return $this->save($request);
        
        $customer = new Customer();
        $title = 'Add Customer';
        $breadcrumbs = [
            ['link' => url('/'), 'name' => "Home"],
            ['link' => url('admin/customers'), 'name' => "Customers"],
            ['name' => "Add"],
        ];
        
        $fields = $customer->fields();
        $columns = $customer->getColumns();
        
        return view('customer-module::form', get_defined_vars());
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(\Scaffolding\Requests\ScaffoldingRequest $request, $id)
    {
        $customer = Customer::with('addresses')->findOrFail($id);
        
        $this->setConfig([
            'model' => $customer,
        ]);
        
        if ($request->isMethod('patch')) return $this->save($request);
        
        $title = 'Edit Customer';
        $breadcrumbs = [
            ['link' => url('/'), 'name' => "Home"],
            ['link' => url('admin/customers'), 'name' => "Customers"],
            ['name' => "Edit"],
        ];
        
        $fields = $customer->fields();
        $columns = $customer->getColumns();
        
        return view('customer-module::form', get_defined_vars());
    }

    /**
     * Fetch addresses list for a customer.
     */
    public function getAddresses($customerId)
    {
        $customer = Customer::findOrFail($customerId);
        return response()->json([
            'success' => true,
            'addresses' => $customer->addresses()->orderBy('is_primary', 'desc')->get()
        ]);
    }

    /**
     * Store a newly created address.
     */
    public function storeAddress(Request $request, $customerId)
    {
        $customer = Customer::findOrFail($customerId);
        
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:255',
            'province' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'district' => 'required|string|max:255',
            'village' => 'required|string|max:255',
            'address' => 'required|string',
            'postal_code' => 'required|string|max:10',
            'is_primary' => 'boolean',
        ]);

        if ($request->boolean('is_primary')) {
            $customer->addresses()->update(['is_primary' => false]);
        }

        $address = $customer->addresses()->create($data);

        return response()->json([
            'success' => true,
            'message' => 'Alamat berhasil ditambahkan.',
            'address' => $address
        ]);
    }

    /**
     * Update the specified address.
     */
    public function updateAddress(Request $request, $customerId, $addressId)
    {
        $customer = Customer::findOrFail($customerId);
        $address = $customer->addresses()->findOrFail($addressId);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:255',
            'province' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'district' => 'required|string|max:255',
            'village' => 'required|string|max:255',
            'address' => 'required|string',
            'postal_code' => 'required|string|max:10',
            'is_primary' => 'boolean',
        ]);

        if ($request->boolean('is_primary')) {
            $customer->addresses()->update(['is_primary' => false]);
        }

        $address->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Alamat berhasil diperbarui.',
            'address' => $address
        ]);
    }

    /**
     * Remove the specified address.
     */
    public function deleteAddress($customerId, $addressId)
    {
        $customer = Customer::findOrFail($customerId);
        $address = $customer->addresses()->findOrFail($addressId);
        $address->delete();

        return response()->json([
            'success' => true,
            'message' => 'Alamat berhasil dihapus.'
        ]);
    }
}
