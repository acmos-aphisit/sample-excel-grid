<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    public $timestamps = false;
    public $incrementing = false;

    protected $table = 'm_user';
    protected $primaryKey = 'user_no';

    protected $fillable = [
        "user_id",
        "user_password",
        "user_name",
        "affiliation_section_no",
        "security_level",
    ];

    public function getAuthPassword()
    {
        return $this->user_password;
    }
}
