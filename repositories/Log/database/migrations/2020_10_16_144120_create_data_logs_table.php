<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use Qollam\Log\LogModule;

class CreateDataLogsTable extends Migration
{
    /**
     * Koneksi database untuk log.
     *
     * @var string
     */
    protected $connection;

    public function __construct()
    {
        // Ambil koneksi dari module jika ada, kalau tidak pakai koneksi default Laravel
        $this->connection = LogModule::$alias ?? config('database.default', 'mysql');
    }

    /**
     * Jalankan migrasi.
     *
     * @return void
     */
    public function up()
    {
        Schema::connection($this->connection)->create('data_logs', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('table', 100)->nullable();
            $table->string('model', 255)->nullable();
            $table->unsignedBigInteger('key')->nullable();
            $table->string('method', 10)->nullable();
            $table->string('action', 50)->nullable();
            $table->string('ip_address', 50)->nullable();
            $table->text('url')->nullable();
            $table->text('parameter')->nullable();
            $table->text('before')->nullable();
            $table->text('after')->nullable();
            $table->text('dirty')->nullable();
            $table->text('response')->nullable();
            $table->string('status', 150)->nullable();
            $table->integer('code')->nullable();
            $table->text('message')->nullable();
            $table->text('errors')->nullable();
            $table->integer('count_parameter')->default(0);
            $table->decimal('elapsed', 8, 3)->default(0);
            $table->string('model_confirmed_by', 255)->nullable();
            $table->unsignedBigInteger('confirmed_by')->nullable();
            $table->dateTime('confirmed_at')->nullable();
            $table->string('model_created_by', 255)->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Rollback migrasi.
     *
     * @return void
     */
    public function down()
    {
        Schema::connection($this->connection)->dropIfExists('data_logs');
    }
}
