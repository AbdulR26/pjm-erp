<?php

if (!function_exists('get_http_status')) {
    /**
     * @param null|int $code
     * @param null|mixed $default
     * @return array|mixed|null
     * @source https://httpstatuses.com/
     */
    function get_http_status($code = null, $default = null)
    {
        $status_code = [
            100 => 'Continue',
            101 => 'Switching Protocols',
            102 => 'Processing',
            200 => 'OK',
            201 => 'Created',
            202 => 'Accepted',
            203 => 'Non-Authoritative Information',
            204 => 'No Content',
            205 => 'Reset Content',
            206 => 'Partial Content',
            207 => 'Multi-Status',
            208 => 'Already Reported',
            226 => 'IM Used',
            300 => 'Multiple Choices',
            301 => 'Moved Permanently',
            302 => 'Found',
            303 => 'See Other',
            304 => 'Not Modified',
            305 => 'Use Proxy',
            306 => '(Unused)',
            307 => 'Temporary Redirect',
            308 => 'Permanent Redirect',
            400 => 'Bad Request',
            401 => 'Unauthorized',
            402 => 'Payment Required',
            403 => 'Forbidden',
            404 => 'Not Found',
            405 => 'Method Not Allowed',
            406 => 'Not Acceptable',
            407 => 'Proxy Authentication Required',
            408 => 'Request Timeout',
            409 => 'Conflict',
            410 => 'Gone',
            411 => 'Length Required',
            412 => 'Precondition Failed',
            413 => 'Request Entity Too Large',
            414 => 'Request-URI Too Long',
            415 => 'Unsupported Media Type',
            416 => 'Requested Range Not Satisfiable',
            417 => 'Expectation Failed',
            418 => 'I\'m a teapot',
            421 => 'Misdirected Request',
            422 => 'Unprocessable Entity',
            423 => 'Locked',
            424 => 'Failed Dependency',
            426 => 'Upgrade Required',
            428 => 'Precondition Required',
            429 => 'Too Many Requests',
            431 => 'Request Header Fields Too Large',
            444 => 'Connection Closed Without Response',
            451 => 'Unavailable For Legal Reasons',
            499 => 'Client Closed Request',
            500 => 'Internal Server Error',
            501 => 'Not Implemented',
            502 => 'Bad Gateway',
            503 => 'Service Unavailable',
            504 => 'Gateway Timeout',
            505 => 'HTTP Version Not Supported',
            506 => 'Variant Also Negotiates',
            507 => 'Insufficient Storage',
            508 => 'Loop Detected',
            510 => 'Not Extended',
            511 => 'Network Authentication Required',
            599 => 'Network Connect Timeout Error',
        ];

        return !is_null($code) ? ($status_code[$code] ?? $default) : $status_code;
    }
}

if (!function_exists('is_http_status')) {
    /**
     * @param $code
     * @return bool
     */
    function is_http_status($code)
    {
        $status_code = get_http_status();
        return isset($status_code[$code]);
    }
}

if(!function_exists('array_tree')) {
    /**
     * @param array $items
     * @param int $parentId
     * @param array $options
     * @return array
     */
    function array_tree(array $items, $parentId = 0, $options = [])
    {
        $key = $options['key'] ?? 'id';
        $parentKey = $options['parentKey'] ?? 'parent_id';
        $childrenKey = $options['childrenKey'] ?? 'children';
        $tree = [];
        foreach ($items as $element) {
            if ($element[$parentKey] == $parentId) {
                $children = array_tree($items, $element[$key], $options);
                if ($children) {
                    $element[$childrenKey] = $children;
                }
                $tree[] = $element;
            }
        }
        return $tree;
    }
}

if(!function_exists('flatten_array_tree')) {
    /**
     * @param $array
     * @param int $level
     * @return array
     */
    function flatten_array_tree($array, $level = 1, $options = [])
    {
        $childrenKey = $options['childrenKey'] ?? 'children';
        $return = array();
        foreach ($array as $key => $value) {
            $children = [];
            if (isset($value[$childrenKey]) && is_array($value[$childrenKey])) {
                $children = $value[$childrenKey];
                unset($value[$childrenKey]);
            }
            $value['level'] = $level;
            $return[] = $value;
            if ($children) {
                $return = array_merge($return, flatten_array_tree($children, $level + 1, $options));
            }
        }
        return $return;
    }
}

if (!function_exists('getHariRayaName')) {
    function getHariRayaName($key = null)
    {
        $eventNames = [
            1 => 'Hari Raya Idul Fitri',
            'Hari Natal',
            'Tahun Baru Imlek',
            'Hari Raya Nyepi',
        ];
        return is_null($key) ? $eventNames : ($eventNames[$key] ?? null);
    }
}

if (!function_exists('array_merge_recursive_distinct')) {
    /**
     * Merge two arrays recursively, overwriting duplicate keys instead of combining them.
     *
     * @param array $array1
     * @param array $array2
     * @return array
     */
    function array_merge_recursive_distinct(array $array1, array $array2)
    {
        $merged = $array1;
        foreach ($array2 as $key => $value) {
            if (is_array($value) && isset($merged[$key]) && is_array($merged[$key])) {
                $merged[$key] = array_merge_recursive_distinct($merged[$key], $value);
            } else {
                $merged[$key] = $value;
            }
        }
        return $merged;
    }
}

if (!function_exists('elapsed')) {
    /**
     * Get request elapsed time in seconds.
     *
     * @return float
     */
    function elapsed()
    {
        if (defined('LARAVEL_START')) {
            return round(microtime(true) - LARAVEL_START, 4);
        }
        return 0.0;
    }
}
