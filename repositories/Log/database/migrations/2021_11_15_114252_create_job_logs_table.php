<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use Qollam\Log\LogModule;

class CreateJobLogsTable extends Migration
{
    /**
     * Koneksi database yang digunakan (ambil dari LogModule, fallback ke mysql)
     */
    protected $connection;

    public function __construct()
    {
        // Gunakan koneksi dari module jika ada, jika tidak pakai default
        $this->connection = LogModule::$alias ?? config('database.default', 'mysql');
    }

    /**
     * Jalankan migrasi
     *
     * @return void
     */
    public function up()
    {
        Schema::connection($this->connection)->create('job_logs', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('connection', 50)->nullable();
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->string('job', 100)->nullable();
            $table->string('table', 100)->nullable();
            $table->string('model', 255)->nullable();
            $table->unsignedBigInteger('key')->nullable();
            $table->string('action', 50)->nullable();
            $table->text('parameter')->nullable();
            $table->text('data')->nullable();
            $table->string('status', 150)->nullable();
            $table->text('message')->nullable();
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
     * Rollback migrasi
     *
     * @return void
     */
    public function down()
    {
        Schema::connection($this->connection)->dropIfExists('job_logs');
    }
}
