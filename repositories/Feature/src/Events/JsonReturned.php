<?php

namespace Feature\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Queue\SerializesModels;

class JsonReturned
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * @var JsonResponse
     */
    public $response;

    /**
     * @var mixed|null
     */
    public $resource;

    /**
     * @var Request|null
     */
    public $request;

    /**
     * Create a new event instance.
     *
     * @param JsonResponse $response
     * @param mixed|null $resource
     * @param Request|null $request
     */
    public function __construct(JsonResponse $response, $resource = null, Request $request = null)
    {
        $this->response = $response;
        $this->resource = $resource;
        $this->request = $request;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        return new PrivateChannel('feature.json-returned');
    }
}
