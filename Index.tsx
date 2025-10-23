import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Car, Camera, FileText, Scale, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const AnimatedSection = ({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const { ref, isVisible } = useScrollAnimation();
  
  return (
    <div 
      ref={ref} 
      className={`${className} ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const Index = () => {
  const scrollToContact = () => {
    const footer = document.getElementById("contact");
    footer?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32 bg-gradient-to-br from-background via-background to-secondary animate-gradient">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_hsl(48,100%,52%,0.15),transparent_60%)]" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/30 rounded-full px-4 py-2 mb-4">
              <AlertCircle className="w-4 h-4 text-accent" />
              <span className="text-accent font-medium">Экстренная помощь</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
              🚨 Аварийный комиссар в Воронеже — помощь при ДТП 24/7
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Приедем на место ДТП за 15 минут. Бесплатная консультация по телефону!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_30px_hsl(48,100%,52%,0.3)] hover:shadow-[0_0_40px_hsl(48,100%,52%,0.5)] hover:scale-105 transition-all duration-300 relative overflow-hidden group"
                onClick={scrollToContact}
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                <span className="relative">Вызвать комиссара</span>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6 border-primary/30 hover:bg-primary/10 hover:scale-105 hover:border-primary/50 transition-all duration-300"
                asChild
              >
                <a href="tel:+79957192523">
                  <Phone className="w-5 h-5 mr-2" />
                  Позвонить сейчас
                </a>
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground pt-8">
              Работаем по Воронежу и области • Быстро • Надёжно • Круглосуточно
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-secondary/30 relative">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-foreground">
              Почему выбирают нас
            </h2>
          </AnimatedSection>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: Car,
                title: "Выезд за 15 минут",
                description: "Оперативно приезжаем на место происшествия."
              },
              {
                icon: Camera,
                title: "Фото- и видеофиксация ДТП",
                description: "Оформим всё по закону, с доказательствами."
              },
              {
                icon: FileText,
                title: "Оформление документов",
                description: "Для страховой — без ошибок и отказов."
              },
              {
                icon: Scale,
                title: "Помощь при страховых спорах",
                description: "Защитим ваши интересы."
              },
              {
                icon: Clock,
                title: "Работаем 24/7",
                description: "Всегда на связи, даже ночью и в праздники."
              },
              {
                icon: CheckCircle2,
                title: "Опыт более 10 лет",
                description: "Профессионалы своего дела."
              }
            ].map((benefit, index) => (
              <AnimatedSection key={index} delay={index * 100}>
                <Card 
                  className="bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_hsl(48,100%,52%,0.3)] hover:-translate-y-2 group h-full"
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                      <benefit.icon className="w-7 h-7 text-primary group-hover:animate-pulse-slow" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-foreground">
              Как вызвать аварийного комиссара
            </h2>
          </AnimatedSection>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {[
              {
                step: "1",
                title: "Позвоните нам или оставьте заявку",
                description: "Наш специалист сразу уточнит детали ДТП."
              },
              {
                step: "2",
                title: "Комиссар выезжает на место",
                description: "Среднее время прибытия — 10–15 минут."
              },
              {
                step: "3",
                title: "Фиксируем и оформляем ДТП",
                description: "Проводим фотофиксацию, составляем документы."
              },
              {
                step: "4",
                title: "Вы получаете готовый пакет бумаг",
                description: "Для страховой или ГИБДД — без ошибок и задержек."
              }
            ].map((step, index) => (
              <AnimatedSection key={index} delay={index * 150}>
                <div className="relative group">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-2xl font-bold text-primary-foreground shadow-[0_0_20px_hsl(48,100%,52%,0.3)] group-hover:shadow-[0_0_30px_hsl(48,100%,52%,0.5)] group-hover:scale-110 transition-all duration-300 animate-pulse-slow">
                      {step.step}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{step.title}</h3>
                    <p className="text-muted-foreground text-sm">{step.description}</p>
                  </div>
                  {index < 3 && (
                    <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                  )}
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-secondary/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-8">
                Ваш надёжный помощник при ДТП
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Мы — команда профессиональных аварийных комиссаров с опытом более 10 лет.
                Работаем по Воронежу и области круглосуточно, без выходных.
                Наша цель — помочь вам быстро и грамотно оформить ДТП, защитить ваши права и сэкономить время.
              </p>
              <div className="pt-8">
                <Button 
                  size="lg" 
                  className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-[0_4px_20px_hsl(354,70%,54%,0.3)] hover:shadow-[0_8px_30px_hsl(354,70%,54%,0.5)] hover:scale-105 transition-all duration-300 relative overflow-hidden group"
                  asChild
                >
                  <a href="tel:+79957192523">
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                    <Phone className="w-5 h-5 mr-2 relative z-10" />
                    <span className="relative z-10">Позвонить: +7 (995) 719-25-23</span>
                  </a>
                </Button>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-background border-t border-border py-12 relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h3 className="text-2xl font-bold text-foreground">Связаться с нами</h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" size="lg" className="hover:scale-105 hover:border-primary/50 hover:bg-primary/10 transition-all duration-300" asChild>
                  <a href="tel:+79957192523" className="text-lg">
                    <Phone className="w-5 h-5 mr-2" />
                    +7 (995) 719-25-23
                  </a>
                </Button>
                <Button variant="outline" size="lg" className="hover:scale-105 hover:border-primary/50 hover:bg-primary/10 transition-all duration-300" asChild>
                  <a href="tel:+79518703934" className="text-lg">
                    <Phone className="w-5 h-5 mr-2" />
                    +7 (951) 870-39-34
                  </a>
                </Button>
              </div>
            
              <div className="pt-8 border-t border-border space-y-2">
                <p className="text-muted-foreground">
                  © 2025 вызовдтп.рф
                </p>
                <p className="text-sm text-muted-foreground">
                  Аварийный комиссар Воронеж — помощь при ДТП 24/7
                </p>
                <div className="flex gap-4 justify-center text-sm text-muted-foreground">
                  <a href="#" className="hover:text-primary transition-colors duration-300 hover:scale-110 inline-block">Политика конфиденциальности</a>
                  <span>|</span>
                  <a href="#contact" className="hover:text-primary transition-colors duration-300 hover:scale-110 inline-block">Связаться с нами</a>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </footer>
    </div>
  );
};

export default Index;
