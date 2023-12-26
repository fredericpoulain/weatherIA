<?php

namespace App\Form;

use App\Entity\Users;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Email;
use Symfony\Component\Validator\Constraints\IsTrue;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\Validator\Constraints\NotBlank;

class RegistrationFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('email', EmailType::class, [
                'label' => 'Adresse email *',
                'attr' => [
                    'class' => 'email',
                    'placeholder' => 'exemple@domaine.com'
                ],
                'constraints' => [
                    new NotBlank([
                        'message' => 'Vous devez indiquer une adresse email.',
                    ]),
                    new Email([
                        'message' => 'L\'adresse email n\'est pas valide.',
                    ]),
                ]
            ])
            ->add('userName', TextType::class, [
                'label' => 'Pseudo *',
                'attr' => [
                    'class' => 'userName',
                    'placeholder' => "Votre nom d'utilisateur"
                ],
                'constraints' => [
                    new NotBlank([
                        'message' => 'Vous devez indiquer un peudo.',
                    ])
                ]
            ])
            ->add('plainPassword', PasswordType::class, [
                'mapped' => false,
                'attr' => [
                    'autocomplete' => 'new-password',
                    'class' => 'password',
                ],
                'constraints' => [
                    new NotBlank([
                        'message' => 'Veuillez entrer un mot de passe',
                    ]),
                    new Length([
                        'min' => 8,
                        'minMessage' => 'Votre mot de passe ne peut pas être inférieur à {{ limit }} caractères',
                        'max' => 4096,
                    ]),
                ],
            ])
            //confirmPassword : honeyPots.
            ->add('confirmPassword', PasswordType::class, [
                'mapped' => false,
                'attr' => [
                    'class' => 'confirmPassword',
                ]
            ]);

    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Users::class,
        ]);
    }
}
