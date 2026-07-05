<?php

namespace Qollam\Log\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Qollam\Log\LogModule;
use Qollam\Log\Models\ApiLog;
use Qollam\Log\Models\DataLog;
use Qollam\Log\Models\JobLog;
use View;
use DB;
use Response;

class LogController extends Controller
{
    public function dataLogs(Request $request)
    {
        if ($request->ajax()) {
            $query = DataLog::query();
            
            // Handle filters
            if ($request->filled('date_from')) {
                $query->where('created_at', '>=', \Illuminate\Support\Carbon::parse($request->date_from)->toDateTimeString());
            }
            if ($request->filled('date_to')) {
                $query->where('created_at', '<=', \Illuminate\Support\Carbon::parse($request->date_to)->toDateTimeString());
            }
            if ($request->filled('url')) {
                $query->where('url', 'like', "%{$request->url}%");
            }
            if ($request->filled('ip_address')) {
                $query->where('ip_address', 'like', "%{$request->ip_address}%");
            }
            if ($request->filled('table')) {
                $query->where('table', 'like', "%{$request->table}%");
            }
            if ($request->filled('action')) {
                $query->where('action', 'like', "%{$request->action}%");
            }
            if ($request->filled('key')) {
                $query->where('key', trim($request->key));
            }

            return \DataTables::eloquent($query)
                ->editColumn('action', function($item) {
                    $action = strtolower($item->action);
                    $color = match ($action) {
                        'create' => 'success',
                        'update' => 'warning',
                        'delete' => 'danger',
                        default => 'secondary',
                    };
                    return '<span class="badge bg-' . $color . ' text-uppercase">' . $item->action . '</span>';
                })
                ->editColumn('before', function($item) {
                    if (!$item->before || !$item->before->count()) return '';
                    $html = '<ul style="max-width: 300px; max-height: 200px; overflow: auto; padding-left:15px; font-size:11px; margin:0; list-style-type: disc;">';
                    foreach ($item->before as $key => $value) {
                        $html .= '<li><strong>' . e($key) . '</strong>: ' . (is_array($value) ? json_encode($value) : e($value)) . '</li>';
                    }
                    $html .= '</ul>';
                    return $html;
                })
                ->editColumn('after', function($item) {
                    if (!$item->after || !$item->after->count()) return '';
                    $html = '<ul style="max-width: 300px; max-height: 200px; overflow: auto; padding-left:15px; font-size:11px; margin:0; list-style-type: disc;">';
                    foreach ($item->after as $key => $value) {
                        $html .= '<li><strong>' . e($key) . '</strong>: ' . (is_array($value) ? json_encode($value) : e($value)) . '</li>';
                    }
                    $html .= '</ul>';
                    return $html;
                })
                ->editColumn('elapsed', function($item) {
                    return $item->elapsed . ' s';
                })
                ->editColumn('created_at', function($item) {
                    return $item->created_at ? $item->created_at->format('d/m/Y H:i:s') : '-';
                })
                ->addColumn('options', function($item) {
                    return '<button class="btn btn-gd-success btn-detail" data-url="' . route('data-logs.detail', $item->id) . '">Detail</button>';
                })
                ->rawColumns(['action', 'before', 'after', 'options'])
                ->toJson();
        }

        $dateFrom = now()->startOfDay();
        $dateTo = now()->endOfDay();

        return view(LogModule::$alias . '::data-logs', get_defined_vars());
    }

    public function detailDataLog($id)
    {
        $log = DataLog::findOrNew($id);
        return Response::json([
            'status' => 'SUCCESS',
            'html' => view(LogModule::$alias . '::data-log-detail', get_defined_vars())->render()
        ]);
    }

    public function apiLogs(Request $request)
    {
        if ($request->ajax()) {
            $query = ApiLog::query();
            
            // Handle filters
            if ($request->filled('date_from')) {
                $query->where('created_at', '>=', \Illuminate\Support\Carbon::parse($request->date_from)->toDateTimeString());
            }
            if ($request->filled('date_to')) {
                $query->where('created_at', '<=', \Illuminate\Support\Carbon::parse($request->date_to)->toDateTimeString());
            }
            if ($request->filled('url')) {
                $query->where('url', 'like', "%{$request->url}%");
            }
            if ($request->filled('method')) {
                $query->where('method', 'like', "%{$request->method}%");
            }
            if ($request->filled('ip_address')) {
                $query->where('ip_address', 'like', "%{$request->ip_address}%");
            }
            if ($request->filled('status')) {
                $query->where('status', 'like', "%{$request->status}%");
            }

            return \DataTables::eloquent($query)
                ->editColumn('method', function($item) {
                    return '<span class="badge bg-secondary text-uppercase">' . $item->method . '</span>';
                })
                ->editColumn('errors', function($item) {
                    if (!$item->errors || !$item->errors->count()) return '';
                    $html = '<ul style="max-width: 300px; max-height: 200px; overflow: auto; padding-left:15px; font-size:11px; margin:0; list-style-type: disc;">';
                    foreach ($item->errors as $key => $value) {
                        $html .= '<li><strong>' . e($key) . '</strong>: ' . e($value) . '</li>';
                    }
                    $html .= '</ul>';
                    return $html;
                })
                ->editColumn('elapsed', function($item) {
                    return $item->elapsed . ' s';
                })
                ->editColumn('created_at', function($item) {
                    return $item->created_at ? $item->created_at->format('d/m/Y H:i:s') : '-';
                })
                ->addColumn('options', function($item) {
                    return '<button class="btn btn-gd-success btn-detail" data-url="' . route('api-logs.detail', $item->id) . '">Detail</button>';
                })
                ->rawColumns(['method', 'errors', 'options'])
                ->toJson();
        }

        $dateFrom = now()->startOfDay();
        $dateTo = now()->endOfDay();

        return view(LogModule::$alias . '::api-logs', get_defined_vars());
    }

    public function detailApiLog($id)
    {
        $log = ApiLog::findOrNew($id);
        return Response::json([
            'status' => 'SUCCESS',
            'html' => view(LogModule::$alias . '::api-log-detail', get_defined_vars())->render()
        ]);
    }

    public function jobLogs(Request $request)
    {
        $dateFrom = now()->startOfDay();
        $dateTo = now()->endOfDay();
        $query = JobLog::latest();
        if($request->has('date_from')) {
            $dateFrom = \Illuminate\Support\Carbon::parse($request->get('date_from'));
        }
        if($request->has('date_to')) {
            $dateTo = \Illuminate\Support\Carbon::parse($request->get('date_to'));
        }
        if($dateFrom) {
            $query->where('created_at', '>=', $dateFrom->toDateTimeString());
        }
        if($dateTo) {
            $query->where('created_at', '<=', $dateTo->toDateTimeString());
        }
        foreach ([
            'job',
            'connection',
            'status',
                 ] as $key) {
            if ($param = $request->get($key)) {
                $query->where($key, $param);
            }
        }
        /** @var \Illuminate\Pagination\LengthAwarePaginator $paginate */
        $paginate = $query->paginate();
        $paginate->appends([
            'date_from' => $request->get('date_from') ?: '',
            'date_to' => $request->get('date_to') ?: '',
            'url' => $request->get('url'),
            'ip_address' => $request->get('ip_address'),
            'table' => $request->get('table'),
            'action' => $request->get('action'),
            'key' => $request->get('key'),
        ]);
        return LogModule::view('job-logs', get_defined_vars());
    }

    public function detailJobLog($id)
    {
        $log = JobLog::findOrNew($id);
        return Response::json([
            'status' => 'SUCCESS',
            'html' => LogModule::view('job-log-detail', get_defined_vars())->render()
        ]);
    }
}
