<?php

namespace App\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\Validator\Constraints\NotBlank;

class UpdatePasswordType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('oldPassword', PasswordType::class, [
                'mapped' => false,
                'label' => "Mot de passe  actuel",
                'attr' => [
                    'class' => 'oldPassword'
                ],
            ])
            ->add('newPassword', PasswordType::class, [
                'mapped' => false,
                'label' => "Nouveau mot de passe",
                'attr' => [
                    'class' => 'newPassword'
                ],
                'constraints' => [
                    new NotBlank([
                        'message' => 'Vous devez indiquer un mot de passe.',
                    ]),
                    new Length([
                        'min' => 8,
                        'minMessage' => 'Votre mot de passe doit avoir au minimum {{ limit }} caractères',
                        'max' => 4096,
                    ]),
                ],
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            // Configure your form options here
        ]);
    }
}
