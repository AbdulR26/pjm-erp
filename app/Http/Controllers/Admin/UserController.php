<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Scaffolding\Traits\ScaffoldingTrait;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Http\Request;

class UserController extends Controller
{
    use ScaffoldingTrait;

    public function __construct()
    {
        $this->setConfig([
            'model' => new User(),
            'title' => 'User Management',
            'url' => 'admin/users',
            'prefix' => 'admin.users',
        ]);

        $this->scaffolding()->datatableColumnUnset(['created_at', 'updated_at', 'action']);
        
        $this->scaffolding()->datatableColumnSet('name', ['title' => 'Nama User']);
        $this->scaffolding()->datatableColumnSet('email', ['title' => 'Email']);
        
        $this->scaffolding()->datatableColumnSet('roles', [
            'title' => 'Roles',
            'orderable' => false,
            'formatter' => function ($model) {
                $roles = $model->roles->pluck('name')->toArray();
                if (empty($roles)) return '<span class="badge badge-light-secondary">No Role</span>';
                
                $badges = '';
                foreach ($roles as $role) {
                    $color = ($role === 'admin') ? 'primary' : 'success';
                    $badges .= '<span class="badge badge-light-' . $color . ' mr-25">' . e($role) . '</span>';
                }
                return $badges;
            }
        ]);

        $this->scaffolding()->datatableColumnSet('action', [
            'title' => 'Actions',
            'searchable' => false,
            'orderable' => false,
            'className' => 'text-center'
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(\Scaffolding\Requests\ScaffoldingRequest $request)
    {
        if ($request->isMethod('put')) return $this->save($request);
        
        $user = new User();
        $title = 'Tambah User Baru';
        $roles = Role::all();
        
        $breadcrumbs = [
            ['link' => url('/'), 'name' => "Home"],
            ['link' => url('admin/users'), 'name' => "Users"],
            ['name' => "Tambah"],
        ];
        
        return view('admin.users.form', get_defined_vars());
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(\Scaffolding\Requests\ScaffoldingRequest $request, $id)
    {
        $user = User::with('roles')->findOrFail($id);
        if ($request->isMethod('patch')) return $this->save($request, $id);
        
        $title = 'Edit User: ' . $user->name;
        $roles = Role::all();
        
        $breadcrumbs = [
            ['link' => url('/'), 'name' => "Home"],
            ['link' => url('admin/users'), 'name' => "Users"],
            ['name' => "Edit"],
        ];
        
        return view('admin.users.form', get_defined_vars());
    }

    /**
     * Save the user.
     */
    public function save(Request $request, $id = null)
    {
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email' . ($id ? ',' . $id : ''),
            'roles' => 'nullable|array',
        ];

        if (!$id) {
            $rules['password'] = 'required|string|min:6';
        } else {
            $rules['password'] = 'nullable|string|min:6';
        }

        $request->validate($rules);

        $user = $id ? User::findOrFail($id) : new User();
        
        $data = [
            'name' => $request->name,
            'email' => $request->email,
        ];

        if ($request->filled('password')) {
            $data['password'] = bcrypt($request->password);
        }

        $user->fill($data);
        $user->save();

        if ($request->has('roles')) {
            $user->syncRoles($request->roles);
        } else {
            $user->syncRoles([]);
        }

        return redirect()->route('admin.users.index')->with('success', 'User berhasil disimpan.');
    }
}
