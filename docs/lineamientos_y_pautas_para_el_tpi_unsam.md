# Trabajo Práctico Integrador - Lineamientos de entrega y evaluación
**Requisitos, especificaciones técnicas, criterios de evaluación y condiciones de aprobación**

* **Institución:** Escuela de Ciencia y Tecnología (ECYT - UNSAM) - Universidad Pública Argentina
* **Asignatura:** Programación Avanzada (Programación III)
* **Carrera:** Licenciatura en Tecnología Informática
* **Versión de documento:** 1.0.0

> *1976-2026 | 50 años por la Memoria, la Verdad y la Justicia - Nunca Más*  
> *Material de cátedra de uso interno - Escuela de Ciencia y Tecnología (ECYT-UNSAM). Su reproducción fuera del ámbito académico de la cátedra requiere autorización previa del docente.*

---

## Índice de contenidos
* [Introducción](#introduccion)
* [1. Objetivos](#1-objetivos)
* [2. Temática del Proyecto](#2-tematica-del-proyecto)
* [3. Requisitos del Proyecto](#3-requisitos-del-proyecto)
* [4. Especificaciones Técnicas](#4-especificaciones-tecnicas)
* [5. Entrega](#5-entrega)
* [6. Consignas](#6-consignas)
* [7. Evaluación](#7-evaluacion)
* [8. Fecha de revisiones](#8-fecha-de-revisiones)
* [9. Fecha de entrega](#9-fecha-de-entrega)
* [10. Lineamientos](#10-lineamientos)
* [11. Condiciones de aprobación](#11-condiciones-de-aprobacion)

---

## Introducción
Los trabajos prácticos integradores tienen como finalidad generar las capacidades y habilidades necesarias para saber interpretar claramente los objetivos del problema y poder resolverlo, aplicando una adecuada estrategia en la resolución de los diferentes problemas que se proponen a los estudiantes de la asignatura.

El alumno deberá hacer revisiones parciales de avances establecidos por el docente durante la cursada. Los docentes harán el seguimiento del alumno en cada entrega y exposición del trabajo práctico integrador, el cual se calificará con una nota individual en la instancia evaluatoria del mismo, definida en una fecha posterior a la exposición de los trabajos prácticos integradores de la asignatura, establecida por los docentes a cargo de la materia.

## 1. Objetivos
1. Aplicar los conceptos de fundamentos de programación backend aplicando el lenguaje de programación Java vistos durante el transcurso del periodo del ciclo educativo.
2. Desarrollar habilidades en el uso de variables, estructuras de control, estructuras de datos y aplicar los conceptos de programación orientada a objetos en tecnologías Java.
3. Desarrollar habilidades y el pensamiento crítico para la resolución de problemas.
4. Los alumnos formarán equipos de trabajo de 3 colaboradores los cuales deberán compartir código y ofrecer distintas soluciones, expresar ideas y soluciones técnicas de manera clara y comprensible, aprender a gestionar el tiempo y cumplir con los plazos en proyectos de programación.

## 2. Temática del Proyecto
El Trabajo Práctico Integrador estará orientado al desarrollo de soluciones tecnológicas vinculadas con el **Diseño Universal para el Aprendizaje (DUA)** y la **Educación Asistida**. Los proyectos deberán abordar una problemática educativa concreta y acotada, orientada a facilitar, acompañar o mejorar los procesos de enseñanza y aprendizaje, contemplando diferentes necesidades y formas de acceso a los contenidos.

Las propuestas podrán abordar, entre otras posibilidades, dificultades específicas en el aprendizaje de determinados contenidos, diferentes formas de presentación de la información, accesibilidad, organización de actividades, acompañamiento del aprendizaje o herramientas de asistencia educativa.

El proyecto deberá presentar un alcance acotado que permita su planificación, desarrollo, ejecución y demostración durante el período establecido para el Trabajo Práctico Integrador.

## 3. Requisitos del Proyecto
1. **Funcionalidad Principal:** La aplicación debe permitir a los usuarios desarrollar distintos procedimientos y operaciones (alta, baja, modificación, listar - ABML) usando las fases de desarrollo de un programa, aplicando buenas prácticas de código y documentación mediante comentarios, y especificando el desempeño del mismo.
2. **Interfaz de Usuario:** Debe incluir una interfaz simple que permita al usuario interactuar con la aplicación y mostrar un menú de opciones.
3. **Estructura del Código fuente:** El código deberá estar organizado en una arquitectura empresarial mediante paquetes y clases, aplicando una estructura coherente con los principios de desarrollo de aplicaciones backend en Java y Spring Boot. Se deberá utilizar una adecuada separación de responsabilidades y definir la visibilidad de atributos y métodos según corresponda, priorizando el encapsulamiento y la organización modular del código.
   * La aplicación deberá contemplar una estructura acorde con el enfoque de Spring Boot, incluyendo, según las necesidades del proyecto, inyección de dependencias e inversión de control (IoC), configuración de componentes y organización de las capas o responsabilidades involucradas. En el desarrollo de aplicaciones web se deberán considerar los componentes de Spring MVC, incluyendo Controllers, Model y Views, cuando corresponda, así como mecanismos de acceso a datos mediante JPA/Hibernate y consultas sobre la base de datos.
   * En caso de implementar una API REST, deberá contemplar la definición de recursos, endpoints, DTO, `ResponseEntity` y validaciones, utilizando criterios apropiados para el intercambio de información. Se podrá incorporar documentación de la API mediante herramientas como Swagger/OpenAPI y realizar pruebas de los endpoints utilizando Postman.
   * El proyecto deberá incorporar mecanismos de validación, manejo adecuado de errores y pruebas automatizadas, pudiendo utilizar Spring Boot Test y MockMvc, así como herramientas de medición de cobertura como JaCoCo.
4. **Validaciones:** Se deberán validar los datos ingresados (solo validaciones funcionales, no validaciones de tipo de dato), para garantizar el correcto funcionamiento del producto y así evitar excepciones.
5. **Comentarios y documentación:** El código debe estar comentado adecuadamente, explicando los procedimientos y operaciones para la cual fueron desarrollados los distintos módulos propuestos.

## 4. Especificaciones Técnicas
* **Lenguaje de programación:** Java, utilizando una versión compatible con la configuración de Spring Boot definida para el proyecto.
* **Framework y entorno de desarrollo:** Spring Boot como framework principal para el desarrollo del backend. Para la implementación y exposición del Trabajo Práctico Integrador en laboratorio se podrá utilizar Visual Studio Code (VS Code).
* **Arquitectura de la aplicación:** La aplicación deberá implementar una arquitectura organizada en capas, separando las responsabilidades correspondientes a la presentación o controladores, lógica de negocio y acceso a datos. La organización deberá favorecer la separación de responsabilidades, el mantenimiento y la evolución de la aplicación.
* **Gestión del proyecto y dependencias:** Se deberá utilizar Maven para la gestión de dependencias, configuración y construcción del proyecto.
* **Persistencia y acceso a datos:** Cuando el proyecto requiera almacenamiento persistente, se podrá utilizar JPA/Hibernate para el acceso a una base de datos, utilizando SQL Server como motor de base de datos y SQL Server Management Studio (SSMS) para su administración.
* **Pruebas y consumo de servicios:** Para la prueba y demostración de los endpoints de las APIs REST se podrá utilizar Postman. Cuando corresponda, podrán incorporarse pruebas automatizadas mediante Spring Boot Test y JUnit 5.
* **Pruebas automatizadas de APIs:** En los proyectos que implementen servicios REST, podrán utilizarse herramientas como MockMvc, junto con JUnit 5, para automatizar pruebas de controladores y endpoints. Postman podrá utilizarse para realizar pruebas manuales y demostraciones de los servicios.
* **Documentación de APIs:** En los proyectos que implementen servicios REST, podrá utilizarse Swagger/OpenAPI para documentar los recursos, endpoints, parámetros, operaciones y respuestas disponibles.

### Exposición en laboratorio
* La presentación y demostración del Trabajo Práctico Integrador deberá realizarse sobre el entorno de desarrollo utilizado por el estudiante (VS Code), mostrando la ejecución de la aplicación, su funcionamiento y, cuando corresponda, la interacción con la base de datos y los servicios desarrollados.

## 5. Entrega
El proyecto debe ser exportado y entregado en formato `.zip`, debe incluir el código fuente y cualquier otra documentación opcional. Además, deberá compilar y funcionar de manera correcta. No se aceptarán los proyectos incompletos o que presenten fallos de funcionamiento, de lógica de programación, que se encuentren desarrollados en otras tecnologías o que tengan comportamientos inesperados. No se aceptarán proyectos entregados fuera de la fecha de entrega establecida.

## 6. Consignas
Una vez conformados los equipos de desarrollo, cada equipo deberá proponer uno o más proyectos posibles que se encuadren dentro de la categoría o clasificación asignada por el/los docente/s. A partir de las propuestas realizadas, cada equipo deberá seleccionar y presentar un proyecto para desarrollar durante el trabajo práctico.

La propuesta deberá ser evaluada y aprobada por el/los docente/s antes de iniciar su desarrollo. El/los docente/s podrán rechazar una propuesta cuando consideren que no se ajusta a la categoría asignada, no cumple con los requerimientos establecidos para el trabajo práctico o presenta características equivalentes a una propuesta previamente seleccionada por otro equipo. En caso de rechazo, el equipo deberá presentar una nueva propuesta para su evaluación.

Una vez aprobada la propuesta, se deberá planificar, diseñar, complementar, codificar, ejecutar y probar la aplicación, definiendo sus propiedades y el comportamiento esperado.

Además, se deberá definir y agregar la información correspondiente a cada escenario, con el propósito de mejorar la experiencia de usuario.

## 7. Evaluación
El equipo o integrantes que no se presenten el día de la exposición del trabajo práctico integrador quedarán de manera automática descalificados y no podrán aprobar o promocionar la asignatura ya que la misma es una instancia evaluatoria obligatoria y necesaria para la aprobación de la materia. Se aplica la misma norma descrita para el día de la evaluación individual.

El proyecto se evaluará en función de los siguientes criterios:
1. **Funcionalidad (20%):** La aplicación cumple con todos los requisitos especificados.
2. **Calidad del Código (20%):** El código está bien estructurado, comentado y sigue buenas prácticas de programación.
3. **Interfaz de Usuario (10%):** La interfaz de usuario es intuitiva y fácil de usar.
4. **Creatividad y Funcionalidades Adicionales (30%):** Se valorará la implementación de funcionalidades adicionales no requeridas.
5. **Exposición oral del equipo de trabajo (20%):** La duración de la misma deberá desarrollarse en un periodo de tiempo máximo de 15 minutos y la distribución del tiempo deberá ser de manera equitativa dependiendo de la cantidad de los integrantes, de manera que todos deben exponer el proyecto integrador.

## 8. Fecha de revisiones
La fecha para la inspección y corrección y/o modificaciones del trabajo práctico es el **28-10-2026**.

## 9. Fecha de entrega
La fecha límite para la entrega del trabajo práctico es el **11-11-2026**.

## 10. Lineamientos
Deberán entregar y ajustar el nombre del proyecto suministrado en formato ZIP, respetando las siguientes indicaciones:
* `P3-<cuatrimestre>-<año>-<turno>-<equipo>-<nombre de proyecto>`
* Se deberán reemplazar las secciones resaltadas con los datos apropiados.
* **Ejemplo:** `P3-Q2-2026-TN-Softech-SIGVeterinaria`

Se deberá entregar la instancia evaluatoria práctica grupal en el campus virtual de la cátedra (en la práctica determinada para tal fin) una vez finalizado y/o solicitado por el docente. Si no se ha hecho la entrega del mismo por descuido o se realiza la entrega de otro tipo de documento, el mismo será anulado sin excepción.

Verificar que el proyecto esté correctamente enviado y entregado en la sección de trabajos prácticos integradores, ya que, en base a esa entrega se realizarán las observaciones y correcciones de las mismas.

La versión de Java del proyecto deberá ser ajustada a la solicitada por la cátedra (**Java 21**).

## 11. Condiciones de aprobación
Se considerará desaprobado todo proyecto que:
* **a.** no compile, o,
* **b.** no se identifiquen los atributos necesarios para resolver lo solicitado, o,
* **c.** los tipos de datos elegidos para los atributos no sean los adecuados, o no cumpla con las condiciones mínimas solicitadas por la especificación de requisitos en el enunciado.
* **d.** La entrega esté vacía o se envíe otro documento por error, sin excepción.
* **e.** El equipo de desarrollo no se haya registrado en la planilla de equipos de proyectos, no tengan un nombre asignado y/o no tengan elegido un proyecto a desarrollar.

---

**Ing. Di Ludovico Maximiliano**  
Programación III  
Escuela de Ciencia y Tecnología (ECYT)  
Universidad Nacional de San Martín (UNSAM)  

*CAMPUS MIGUELETE - Av. 25 de Mayo y Francia, San Martín, Buenos Aires, Argentina*  
*(+54 11) 4006 1500 - mail@unsam.edu.ar - www.unsam.edu.ar*