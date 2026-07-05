@php
    $parent = $parent ?? null;
    $style = $parent ?? null;
@endphp
<ul{{$style ? " style=$style" : '' }}>
    @foreach($items as $key => $value)
        @if(is_array($value))
            <li>{!! $key !!} :
{{--            <li>{!! $parent && is_numeric($key) ? "$parent.$key" : $key !!} :--}}
            @include(\Qollam\Log\LogModule::$alias . '::array-to-ul', ['items' => $value, 'parent' => $key])
            </li>
        @else
            <li>{!! $key !!} : {!! $value !!}</li>
{{--            <li>{!! $parent && is_numeric($key) ? "$parent.$key" : $key !!} : {!! $value !!}</li>--}}
        @endif
    @endforeach
</ul>