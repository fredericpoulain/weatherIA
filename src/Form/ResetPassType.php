<?php

namespace App\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\Validator\Constraints\NotBlank;

class ResetPassType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('password', PasswordType::class, [
                'mapped' => false,
                'attr' => [
                    'class' => 'password',
                ],
                'constraints' => [
                    new NotBlank([
                        'message' => 'Le champ mot de passe ne peut pas être vide ',
                    ]),
                    new Length([
                        'min' => 8,
                        'minMessage' => 'Votre mot de passe ne peut pas être inférieur à {{ limit }} caractères',
                        'max' => 4096,
                    ]),
                ],
            ]);
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            // Configure your form options here
        ]);
    }
}
