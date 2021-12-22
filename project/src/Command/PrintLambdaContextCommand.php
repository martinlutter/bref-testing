<?php

namespace App\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class PrintLambdaContextCommand extends Command
{
    protected function configure()
    {
        $this->setName('lambda:print');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $output->writeln(
            var_export(json_decode($_SERVER['LAMBDA_INVOCATION_CONTEXT'], true, 512, JSON_THROW_ON_ERROR))
        );

        return 0;
    }
}
