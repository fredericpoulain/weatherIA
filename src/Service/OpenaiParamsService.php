<?php

namespace App\Service;

class OpenaiParamsService
{
//    public function __construct(private readonly string $openaiApiKey)
//    {
//    }

    public function prepareParams(string $message): array
    {
        return [
            'model' => 'gpt-3.5-turbo',
            'messages' => array(
                array('role' => 'system', 'content' => 'Vous êtes un assistant.'),
                array('role' => 'user', 'content' => $message)
            )
        ];
    }
}